import admin from "firebase-admin";

let initialized = false;

/**
 * Initializes the Firebase Admin SDK safely (idempotent).
 */
export function initFirebaseAdmin() {
  if (initialized || admin.apps.length > 0) {
    initialized = true;
    return admin.app();
  }

  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  // Handle both escaped \n (from .env files) and real newlines
  const privateKey = rawKey.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "";
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    "";

  if (!privateKey || !clientEmail || !projectId) {
    console.error(
      "[Firebase Admin] Missing credentials. Check FIREBASE_ADMIN_PRIVATE_KEY, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_PROJECT_ID in .env"
    );
    // Still initialize with empty credentials so the app doesn't crash on import;
    // verifyIdToken will throw descriptive errors.
    return admin.initializeApp();
  }

  initialized = true;
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey,
      clientEmail,
    }),
  });
}

/**
 * Verifies a Firebase ID Token and returns the decoded token.
 * Throws TRPCError-compatible errors for invalid/expired tokens.
 */
export async function verifyIdToken(token: string) {
  // Ensure admin is initialized before verifying
  if (!initialized && admin.apps.length === 0) {
    initFirebaseAdmin();
  }
  return admin.auth().verifyIdToken(token);
}
