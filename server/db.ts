import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, quizResults, quizAttempts, InsertQuizResult, QuizResult } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function saveQuizResult(userId: number | null, data: InsertQuizResult): Promise<QuizResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get current time in Thailand timezone (UTC+7)
  const now = new Date();
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
  const thailandTime = new Date(utcTime.getTime() + (7 * 60 * 60 * 1000));

  const result = await db
    .insert(quizResults)
    .values({
      ...data,
      userId: userId || 0,
      createdAt: thailandTime,
    })
    .$returningId();

  const savedResult = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.id, result[0].id))
    .limit(1);

  return savedResult[0]!;
}

export async function getQuizResultsByUserId(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, userId))
    .orderBy(desc(quizResults.createdAt))
    .limit(limit);
}

export async function getUserQuizStats(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const results = await db
    .select()
    .from(quizResults)
    .where(eq(quizResults.userId, userId));

  if (results.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      bestScore: 0,
      recentResults: [],
    };
  }

  const averageScore = Math.round(
    results.reduce((sum, r) => sum + r.percentage, 0) / results.length
  );
  const bestScore = Math.max(...results.map((r) => r.percentage));

  return {
    totalAttempts: results.length,
    averageScore,
    bestScore,
    recentResults: results.slice(-5).reverse(),
  };
}

export async function getLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get the best score for each user
  const results = await db
    .select({
      userId: quizResults.userId,
      userName: users.name,
      bestScore: quizResults.percentage,
    })
    .from(quizResults)
    .innerJoin(users, eq(quizResults.userId, users.id))
    .orderBy(desc(quizResults.percentage))
    .limit(limit);

  return results;
}
