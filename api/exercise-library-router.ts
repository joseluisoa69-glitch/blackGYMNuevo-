import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { exerciseLibrary } from "@db/schema";
import { eq, like, and } from "drizzle-orm";

export const exerciseLibraryRouter = createRouter({
  list: publicQuery.input(z.object({
    grupoMuscular: z.string().optional(),
    equipo: z.string().optional(),
    search: z.string().optional(),
  }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];

    if (input?.grupoMuscular) {
      conditions.push(eq(exerciseLibrary.grupoMuscular, input.grupoMuscular));
    }
    if (input?.equipo) {
      conditions.push(eq(exerciseLibrary.equipo, input.equipo));
    }
    if (input?.search) {
      conditions.push(like(exerciseLibrary.nombre, `%${input.search}%`));
    }

    if (conditions.length > 0) {
      return db.select().from(exerciseLibrary).where(and(...conditions));
    }

    return db.select().from(exerciseLibrary);
  }),

  getByMuscle: publicQuery.input(z.object({
    grupoMuscular: z.string(),
  })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(exerciseLibrary)
      .where(eq(exerciseLibrary.grupoMuscular, input.grupoMuscular));
  }),

  getById: publicQuery.input(z.object({
    id: z.number(),
  })).query(async ({ input }) => {
    const db = getDb();
    const result = await db.select().from(exerciseLibrary)
      .where(eq(exerciseLibrary.id, input.id))
      .limit(1);
    return result[0] || null;
  }),
});
