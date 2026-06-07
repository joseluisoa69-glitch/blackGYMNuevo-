import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { workouts, setsDone, profiles, streaks } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const workoutRouter = createRouter({
  start: authedQuery.input(z.object({
    routineId: z.number().optional(),
    diaNombre: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new Error("Profile not found");

    const result = await db.insert(workouts).values({
      profileId: profile[0].id,
      routineId: input.routineId,
      diaNombre: input.diaNombre,
      fecha: new Date(),
      fechaFin: null,
      duracionMinutos: 0,
      completado: false,
      volumenTotal: 0,
      tenantId: ctx.user.tenantId || "default",
      createdAt: new Date(),
    });

    const workout = await db.select().from(workouts)
      .where(eq(workouts.id, Number(result[0].insertId)))
      .limit(1);

    return workout[0];
  }),

  logSet: authedQuery.input(z.object({
    workoutId: z.number(),
    exerciseName: z.string(),
    setNumber: z.number(),
    pesoKg: z.number().optional(),
    reps: z.number().optional(),
    rpe: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const result = await db.insert(setsDone).values({
      workoutId: input.workoutId,
      exerciseName: input.exerciseName,
      setNumber: input.setNumber,
      pesoKg: input.pesoKg,
      reps: input.reps,
      rpe: input.rpe,
    });

    return db.select().from(setsDone)
      .where(eq(setsDone.id, Number(result[0].insertId)))
      .limit(1);
  }),

  complete: authedQuery.input(z.object({
    workoutId: z.number(),
    duracionMinutos: z.number(),
    volumenTotal: z.number().default(0),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new Error("Profile not found");

    // Complete workout
    await db.update(workouts).set({
      completado: true,
      fechaFin: new Date(),
      duracionMinutos: input.duracionMinutos,
      volumenTotal: input.volumenTotal,
    }).where(eq(workouts.id, input.workoutId));

    // Update streak
    const streak = await db.select().from(streaks)
      .where(eq(streaks.profileId, profile[0].id))
      .limit(1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (streak[0]) {
      const lastDate = streak[0].lastWorkoutDate ? new Date(streak[0].lastWorkoutDate) : null;
      let newStreak = streak[0].currentStreak || 0;
      let newLongest = streak[0].longestStreak || 0;

      if (lastDate) {
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
          if (newStreak > newLongest) newLongest = newStreak;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const newWeekly = (streak[0].weeklyCompleted || 0) + 1;

      await db.update(streaks).set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastWorkoutDate: today,
        weeklyCompleted: newWeekly,
        updatedAt: new Date(),
      }).where(eq(streaks.id, streak[0].id));

      return { success: true, streak: newStreak, weekly: newWeekly };
    } else {
      await db.insert(streaks).values({
        profileId: profile[0].id,
        currentStreak: 1,
        longestStreak: 1,
        lastWorkoutDate: today,
        weeklyCompleted: 1,
        weeklyGoal: 4,
        weekStartDate: today,
      });
      return { success: true, streak: 1, weekly: 1 };
    }
  }),

  history: authedQuery.input(z.object({
    limit: z.number().default(20),
    offset: z.number().default(0),
  }).optional()).query(async ({ ctx, input }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return [];

    return db.select().from(workouts)
      .where(eq(workouts.profileId, profile[0].id))
      .orderBy(desc(workouts.fecha))
      .limit(input?.limit || 20)
      .offset(input?.offset || 0);
  }),

  historyWithSets: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return [];

    const ws = await db.select().from(workouts)
      .where(and(eq(workouts.profileId, profile[0].id), eq(workouts.completado, true)))
      .orderBy(desc(workouts.fecha))
      .limit(50);

    const withSets = await Promise.all(
      ws.map(async (w) => {
        const sets = await db.select().from(setsDone)
          .where(eq(setsDone.workoutId, w.id))
          .orderBy(setsDone.createdAt);
        return { ...w, sets };
      })
    );

    return withSets;
  }),

  getWorkoutSets: authedQuery.input(z.object({ workoutId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(setsDone)
      .where(eq(setsDone.workoutId, input.workoutId))
      .orderBy(setsDone.createdAt);
  }),
});
