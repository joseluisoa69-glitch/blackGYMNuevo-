import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { routines, routineDays, exercises, profiles } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const routineRouter = createRouter({
  getActive: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return null;

    const routine = await db.select().from(routines)
      .where(and(eq(routines.profileId, profile[0].id), eq(routines.activa, true)))
      .limit(1);

    if (!routine[0]) return null;

    const days = await db.select().from(routineDays)
      .where(eq(routineDays.routineId, routine[0].id))
      .orderBy(routineDays.orden);

    const daysWithExercises = await Promise.all(
      days.map(async (day) => {
        const exs = await db.select().from(exercises)
          .where(eq(exercises.dayId, day.id))
          .orderBy(exercises.orden);
        return { ...day, exercises: exs };
      })
    );

    return { ...routine[0], days: daysWithExercises };
  }),

  getById: authedQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const routine = await db.select().from(routines).where(eq(routines.id, input.id)).limit(1);
    if (!routine[0]) return null;

    const days = await db.select().from(routineDays)
      .where(eq(routineDays.routineId, routine[0].id))
      .orderBy(routineDays.orden);

    const daysWithExercises = await Promise.all(
      days.map(async (day) => {
        const exs = await db.select().from(exercises)
          .where(eq(exercises.dayId, day.id))
          .orderBy(exercises.orden);
        return { ...day, exercises: exs };
      })
    );

    return { ...routine[0], days: daysWithExercises };
  }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return [];

    return db.select().from(routines)
      .where(eq(routines.profileId, profile[0].id))
      .orderBy(desc(routines.createdAt));
  }),

  create: authedQuery.input(z.object({
    nombre: z.string(),
    descripcion: z.string().optional(),
    diasPorSemana: z.number().default(3),
    source: z.string().default("manual"),
    days: z.array(z.object({
      nombreDia: z.string(),
      orden: z.number(),
      ejercicios: z.array(z.object({
        nombre: z.string(),
        grupoMuscular: z.string().optional(),
        series: z.number().default(3),
        repeticiones: z.string().default("8-12"),
        descansoSegundos: z.number().default(60),
        notas: z.string().optional(),
        orden: z.number(),
      })),
    })),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new Error("Profile not found");

    // Deactivate existing routines
    await db.update(routines).set({ activa: false })
      .where(eq(routines.profileId, profile[0].id));

    // Create new routine
    const routineResult = await db.insert(routines).values({
      profileId: profile[0].id,
      nombre: input.nombre,
      descripcion: input.descripcion,
      diasPorSemana: input.diasPorSemana,
      activa: true,
      source: input.source,
    });

    const routineId = Number(routineResult[0].insertId);

    // Create days and exercises
    for (const day of input.days) {
      const dayResult = await db.insert(routineDays).values({
        routineId,
        nombreDia: day.nombreDia,
        orden: day.orden,
      });
      const dayId = Number(dayResult[0].insertId);

      for (const ej of day.ejercicios) {
        await db.insert(exercises).values({
          dayId,
          nombre: ej.nombre,
          grupoMuscular: ej.grupoMuscular,
          series: ej.series,
          repeticiones: ej.repeticiones,
          descansoSegundos: ej.descansoSegundos,
          notas: ej.notas,
          orden: ej.orden,
        });
      }
    }

    return { id: routineId, success: true };
  }),

  deactivate: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(routines).set({ activa: false }).where(eq(routines.id, input.id));
    return { success: true };
  }),
});
