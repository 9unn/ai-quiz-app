import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { saveQuizResult, getQuizResultsByUserId, getUserQuizStats, getLeaderboard } from "../db";
import { InsertQuizResult } from "../../drizzle/schema";

export const quizRouter = router({
  /**
   * Save quiz result - requires authentication
   */
  saveResult: protectedProcedure
    .input(
      z.object({
        familiarityLevel: z.number().min(1).max(5),
        score: z.number().min(0),
        totalQuestions: z.number().min(1),
        percentage: z.number().min(0).max(100),
        answers: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await saveQuizResult(ctx.user.id, {
        familiarityLevel: input.familiarityLevel,
        score: input.score,
        totalQuestions: input.totalQuestions,
        percentage: input.percentage,
        answers: input.answers,
      } as InsertQuizResult);

      return {
        success: true,
        resultId: result.id,
        message: "Quiz result saved successfully",
      };
    }),

  /**
   * Get user's quiz results - requires authentication
   */
  getResults: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const results = await getQuizResultsByUserId(ctx.user.id, input?.limit || 10);
      return results;
    }),

  /**
   * Get user's quiz statistics - requires authentication
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getUserQuizStats(ctx.user.id);
    return stats;
  }),

  /**
   * Get global leaderboard - public access
   */
  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }).optional())
    .query(async ({ input }) => {
      const leaderboard = await getLeaderboard(input?.limit || 10);
      return leaderboard;
    }),
});
