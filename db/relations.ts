import { relations } from "drizzle-orm";
import {
  users,
  profiles,
  routines,
  routineDays,
  exercises,
  workouts,
  setsDone,
  bodyProgress,
  streaks,
} from "./schema";

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  routines: many(routines),
  workouts: many(workouts),
  progress: many(bodyProgress),
  streak: one(streaks, {
    fields: [profiles.id],
    references: [streaks.profileId],
  }),
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [routines.profileId],
    references: [profiles.id],
  }),
  days: many(routineDays),
}));

export const routineDaysRelations = relations(routineDays, ({ one, many }) => ({
  routine: one(routines, {
    fields: [routineDays.routineId],
    references: [routines.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  day: one(routineDays, {
    fields: [exercises.dayId],
    references: [routineDays.id],
  }),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [workouts.profileId],
    references: [profiles.id],
  }),
  routine: one(routines, {
    fields: [workouts.routineId],
    references: [routines.id],
  }),
  sets: many(setsDone),
}));

export const setsDoneRelations = relations(setsDone, ({ one }) => ({
  workout: one(workouts, {
    fields: [setsDone.workoutId],
    references: [workouts.id],
  }),
}));

export const bodyProgressRelations = relations(bodyProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [bodyProgress.profileId],
    references: [profiles.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  profile: one(profiles, {
    fields: [streaks.profileId],
    references: [profiles.id],
  }),
}));
