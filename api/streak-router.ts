import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { streaks, profiles } from "@db/schema";
import { eq } from "drizzle-orm";

export const streakRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return null;

    const result = await db.select().from(streaks)
      .where(eq(streaks.profileId, profile[0].id))
      .limit(1);

    if (!result[0]) {
      // Initialize streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await db.insert(streaks).values({
        profileId: profile[0].id,
        currentStreak: 0,
        longestStreak: 0,
        weeklyGoal: 4,
        weeklyCompleted: 0,
        weekStartDate: today,
      });

      const newStreak = await db.select().from(streaks)
        .where(eq(streaks.profileId, profile[0].id))
        .limit(1);
      return newStreak[0];
    }

    // Check if week reset needed
    const weekStart = result[0].weekStartDate ? new Date(result[0].weekStartDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (weekStart) {
      const daysSinceWeekStart = Math.floor((today.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceWeekStart >= 7) {
        // Reset weekly counter
        await db.update(streaks).set({
          weeklyCompleted: 0,
          weekStartDate: today,
          updatedAt: new Date(),
        }).where(eq(streaks.id, result[0].id));

        result[0].weeklyCompleted = 0;
      }
    }

    return result[0];
  }),

  updateGoal: authedQuery.input(z.object({ weeklyGoal: z.number().min(1).max(7) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new Error("Profile not found");

    const streak = await db.select().from(streaks)
      .where(eq(streaks.profileId, profile[0].id))
      .limit(1);

    if (streak[0]) {
      await db.update(streaks).set({
        weeklyGoal: input.weeklyGoal,
        updatedAt: new Date(),
      }).where(eq(streaks.id, streak[0].id));
    }

    return { success: true };
  }),
});
