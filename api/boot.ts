import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { initFirebaseAdmin } from "./lib/firebase-admin";

// Initialize Firebase Admin SDK before handling any requests
initFirebaseAdmin();

const app = new Hono<{ Bindings: HttpBindings }>();

// ── Global middleware ───────────────────────────────────────────────────────
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Fix Google Sign-In popup: allow same-origin popups
app.use("*", async (c, next) => {
  await next();
  c.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  c.header("Cross-Origin-Embedder-Policy", "unsafe-none");
});

// ── tRPC API ────────────────────────────────────────────────────────────────
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
    onError({ error, path }) {
      if (error.code !== "UNAUTHORIZED" && error.code !== "BAD_REQUEST") {
        console.error(`[tRPC error] ${path ?? "unknown"}:`, error.message);
      }
    },
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// SPA fallback para rutas del frontend
app.get('*', async (c) => {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const html = await readFile(join(process.cwd(), "dist/public/index.html"), "utf-8");
    return c.html(html);
  } catch (error) {
    return c.text("index.html not found", 404);
  }
});

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);
  serve({ fetch: app.fetch, port: env.port }, () => {
    console.log(`Server running on http://localhost:${env.port}/`);
  });
}
