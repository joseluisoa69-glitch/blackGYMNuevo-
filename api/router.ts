import { authRouter } from "./auth-router";
import { profileRouter } from "./profile-router";
import { routineRouter } from "./routine-router";
import { workoutRouter } from "./workout-router";
import { streakRouter } from "./streak-router";
import { progressRouter } from "./progress-router";
import { calculatorRouter } from "./calculator-router";
import { exerciseLibraryRouter } from "./exercise-library-router";
import { aiRouter } from "./ai-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  profile: profileRouter,
  routine: routineRouter,
  workout: workoutRouter,
  streak: streakRouter,
  progress: progressRouter,
  calculator: calculatorRouter,
  exerciseLibrary: exerciseLibraryRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
