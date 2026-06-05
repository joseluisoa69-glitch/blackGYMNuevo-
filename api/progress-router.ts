import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { bodyProgress, profiles } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const progressRouter = createRouter({
  get: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) return [];

    return db.select().from(bodyProgress)
      .where(eq(bodyProgress.profileId, profile[0].id))
      .orderBy(desc(bodyProgress.fecha));
  }),

  add: authedQuery.input(z.object({
    peso: z.number().optional(),
    grasaCorporal: z.number().optional(),
    pecho: z.number().optional(),
    cintura: z.number().optional(),
    cadera: z.number().optional(),
    biceps: z.number().optional(),
    muslo: z.number().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const profile = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (!profile[0]) throw new Error("Profile not found");

    const result = await db.insert(bodyProgress).values({
      profileId: profile[0].id,
      ...input,
    });

    return db.select().from(bodyProgress)
      .where(eq(bodyProgress.id, Number(result[0].insertId)))
      .limit(1);
  }),
});
