import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("quiz router", () => {
  it("should save quiz result successfully", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.quiz.saveResult({
      familiarityLevel: 3,
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      answers: {
        "1": "True",
        "2": "Option B",
        "3": "False",
        "4": "True",
        "5": "Data",
      },
    });

    expect(result.success).toBe(true);
    expect(result.resultId).toBeDefined();
    expect(result.message).toBe("Quiz result saved successfully");
  });

  it("should retrieve user quiz results", async () => {
    const ctx = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    // First save a result
    await caller.quiz.saveResult({
      familiarityLevel: 2,
      score: 3,
      totalQuestions: 5,
      percentage: 60,
      answers: {
        "1": "False",
        "2": "Option A",
        "3": "True",
        "4": "False",
        "5": "Learning",
      },
    });

    // Then retrieve results
    const results = await caller.quiz.getResults({ limit: 10 });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty("score");
    expect(results[0]).toHaveProperty("percentage");
  });

  it("should get user quiz statistics", async () => {
    const ctx = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);

    // Save multiple results
    await caller.quiz.saveResult({
      familiarityLevel: 4,
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      answers: { "1": "True", "2": "B", "3": "False", "4": "True", "5": "Data" },
    });

    await caller.quiz.saveResult({
      familiarityLevel: 3,
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      answers: { "1": "False", "2": "A", "3": "True", "4": "False", "5": "Learning" },
    });

    // Get stats
    const stats = await caller.quiz.getStats();

    expect(stats.totalAttempts).toBeGreaterThan(0);
    expect(stats.averageScore).toBeGreaterThan(0);
    expect(stats.bestScore).toBeGreaterThan(0);
    expect(Array.isArray(stats.recentResults)).toBe(true);
  });

  it("should get public leaderboard", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    const leaderboard = await caller.quiz.getLeaderboard({ limit: 10 });

    expect(Array.isArray(leaderboard)).toBe(true);
    // Leaderboard might be empty in test, but should return an array
  });
});
