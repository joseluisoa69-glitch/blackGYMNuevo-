import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { verifyIdToken } from "./lib/firebase-admin";
import { findUserByFirebaseUid, upsertUser } from "./queries/users";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  const authHeader =
    opts.req.headers.get("authorization") ??
    opts.req.headers.get("Authorization") ??
    "";

  if (!authHeader.startsWith("Bearer ")) {
    return ctx; // No token → anonymous context
  }

  const idToken = authHeader.slice(7).trim();
  if (!idToken) return ctx;

  try {
    const decoded = await verifyIdToken(idToken);

    // Ensure we have a UID
    if (!decoded?.uid) return ctx;

    // Look up existing user or auto-create on first login
    let user = await findUserByFirebaseUid(decoded.uid);

    if (!user) {
      user = await upsertUser({
        firebaseUid: decoded.uid,
        name:
          decoded.name ??
          decoded.email?.split("@")[0] ??
          "Usuario",
        email: decoded.email ?? null,
        avatar: decoded.picture ?? null,
        displayName: decoded.name ?? null,
        photoURL: decoded.picture ?? null,
        provider: decoded.firebase?.sign_in_provider ?? "password",
        emailVerified: decoded.email_verified ?? false,
        tenantId: "default",
      });
    }

    ctx.user = user ?? undefined;
  } catch (err: any) {
    // Expired / invalid token — leave ctx.user undefined
    // The requireAuth middleware will throw UNAUTHORIZED if needed
    const code: string = err?.errorInfo?.code ?? err?.code ?? "";
    if (!code.startsWith("auth/")) {
      // Unexpected error — log it
      console.error("[Context] Token verification error:", err);
    }
  }

  return ctx;
}
