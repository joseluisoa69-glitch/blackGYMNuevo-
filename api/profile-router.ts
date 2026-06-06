import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { profiles, users } from "@db/schema";
import { eq } from "drizzle-orm";

export const profileRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const userId = Number(ctx.user.id);

    // Intentar por ID interno
    let result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    // Si no encuentra, buscar por firebaseUid como fallback
    if (!result[0] && ctx.user.firebaseUid) {
      const userResult = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.firebaseUid, ctx.user.firebaseUid))
        .limit(1);
      if (userResult[0]) {
        result = await db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, userResult[0].id))
          .limit(1);
      }
    }

    return result[0] || null;
  }),

  upsert: authedQuery.input(z.object({
    nombre: z.string().optional(),
    fechaNacimiento: z.string().optional(),
    pesoKg: z.number().optional(),
    alturaCm: z.number().optional(),
    genero: z.enum(["masculino", "femenino"]).optional(),
    objetivo: z.enum(["perder_peso", "ganar_musculo", "mantener", "fuerza", "resistencia"]).optional(),
    nivel: z.enum(["principiante", "intermedio", "avanzado"]).optional(),
    diasSemana: z.number().min(1).max(7).optional(),
    tiempoSesion: z.number().optional(),
    lesiones: z.string().optional(),
    notas: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const userId = Number(ctx.user.id);
    const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    if (existing.length > 0) {
      await db.update(profiles).set({ ...input, updatedAt: new Date() }).where(eq(profiles.id, existing[0].id));
      const updated = await db.select().from(profiles).where(eq(profiles.id, existing[0].id)).limit(1);
      return updated[0];
    } else {
      const result = await db.insert(profiles).values({
        userId,
        ...input,
      });
      const inserted = await db.select().from(profiles).where(eq(profiles.id, Number(result[0].insertId))).limit(1);
      return inserted[0];
    }
  }),
});
