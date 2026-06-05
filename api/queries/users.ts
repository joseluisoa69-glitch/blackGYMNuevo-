import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserByFirebaseUid(firebaseUid: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.firebaseUid, firebaseUid))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  // If the user's UID or email matches the owner credentials, assign admin role
  if (
    values.role === undefined &&
    values.firebaseUid &&
    (values.firebaseUid === process.env.OWNER_UNION_ID || 
     (process.env.OWNER_EMAIL && values.email === process.env.OWNER_EMAIL))
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });

  return findUserByFirebaseUid(data.firebaseUid);
}
