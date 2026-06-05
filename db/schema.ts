import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: varchar("firebaseUid", { length: 255 }).notNull().unique(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  displayName: varchar("displayName", { length: 255 }),
  photoURL: text("photoURL"),
  provider: varchar("provider", { length: 50 }),
  emailVerified: boolean("emailVerified").default(false),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Perfiles de usuario extendido
export const profiles = mysqlTable("profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().references(() => users.id),
  nombre: varchar("nombre", { length: 255 }),
  fechaNacimiento: varchar("fechaNacimiento", { length: 10 }),
  pesoKg: float("pesoKg"),
  alturaCm: int("alturaCm"),
  genero: mysqlEnum("genero", ["masculino", "femenino"]).default("masculino"),
  objetivo: mysqlEnum("objetivo", ["perder_peso", "ganar_musculo", "mantener", "fuerza", "resistencia"]).default("mantener"),
  nivel: mysqlEnum("nivel", ["principiante", "intermedio", "avanzado"]).default("principiante"),
  diasSemana: int("diasSemana").default(3),
  tiempoSesion: int("tiempoSesion").default(60),
  lesiones: text("lesiones"),
  notas: text("notas"),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  
  // Nuevos campos para perfil avanzado
  porcentajeGrasa: float("porcentajeGrasa"),
  tipoCuerpo: varchar("tipoCuerpo", { length: 50 }), // Ectomorfo, Mesomorfo, Endomorfo
  trabajo: varchar("trabajo", { length: 50 }), // Sedentario, Físico, Mixto
  horasSueno: int("horasSueno").default(8),
  nivelEstres: int("nivelEstres").default(5),
  comidasPorDia: varchar("comidasPorDia", { length: 50 }), // 1-2, 3, 4-5, 6+
  gramosProteinaDiaria: int("gramosProteinaDiaria"),
  experienciaPrevia: varchar("experienciaPrevia", { length: 50 }), // Nunca, <1 año, 1-3 años, >3 años
  frecuenciaActual: int("frecuenciaActual").default(0),
  cirugiasPrevias: text("cirugiasPrevias"),
  enfermedadesCronicas: text("enfermedadesCronicas"),
  medicamentos: text("medicamentos"),
  doloresPersistentes: text("doloresPersistentes"),
  metaEspecifica: text("metaEspecifica"),
  tiempoMeta: int("tiempoMeta"), // Semanas
  accesoGym: varchar("accesoGym", { length: 50 }), // Gym completo, Mancuernas casa, Bandas, Calistenia
  musculosPrioridad: text("musculosPrioridad"), // Comma separated text
  ejerciciosFavoritos: text("ejerciciosFavoritos"),
  ejerciciosOdiados: text("ejerciciosOdiados"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// Biblioteca de ejercicios
export const exerciseLibrary = mysqlTable("exercise_library", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  grupoMuscular: varchar("grupoMuscular", { length: 100 }).notNull(),
  equipo: varchar("equipo", { length: 100 }).default("destacado"),
  dificultad: mysqlEnum("dificultad", ["facil", "intermedio", "avanzado"]).default("intermedio"),
  descripcion: text("descripcion"),
  instrucciones: text("instrucciones"),
  imagenUrl: text("imagenUrl"),
  videoUrl: text("videoUrl"),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExerciseLibrary = typeof exerciseLibrary.$inferSelect;

// Rutinas
export const routines = mysqlTable("routines", {
  id: serial("id").primaryKey(),
  profileId: bigint("profileId", { mode: "number", unsigned: true }).notNull().references(() => profiles.id),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  descripcion: text("descripcion"),
  diasPorSemana: int("diasPorSemana").default(3),
  activa: boolean("activa").default(true),
  source: varchar("source", { length: 20 }).default("manual"),
  tiempoSesionMinutos: int("tiempoSesionMinutos").default(60),
  nivelRPE: int("nivelRPE").default(7),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Routine = typeof routines.$inferSelect;

// Dias de rutina
export const routineDays = mysqlTable("routine_days", {
  id: serial("id").primaryKey(),
  routineId: bigint("routineId", { mode: "number", unsigned: true }).notNull().references(() => routines.id),
  nombreDia: varchar("nombreDia", { length: 255 }).notNull(),
  orden: int("orden").default(1),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RoutineDay = typeof routineDays.$inferSelect;

// Ejercicios de rutina
export const exercises = mysqlTable("exercises", {
  id: serial("id").primaryKey(),
  dayId: bigint("dayId", { mode: "number", unsigned: true }).notNull().references(() => routineDays.id),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  grupoMuscular: varchar("grupoMuscular", { length: 100 }),
  series: int("series").default(3),
  repeticiones: varchar("repeticiones", { length: 50 }).default("8-12"),
  descansoSegundos: int("descansoSegundos").default(60),
  notas: text("notas"),
  orden: int("orden").default(1),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Exercise = typeof exercises.$inferSelect;

// Entrenamientos (workouts)
export const workouts = mysqlTable("workouts", {
  id: serial("id").primaryKey(),
  profileId: bigint("profileId", { mode: "number", unsigned: true }).notNull().references(() => profiles.id),
  routineId: bigint("routineId", { mode: "number", unsigned: true }).references(() => routines.id),
  diaNombre: varchar("diaNombre", { length: 255 }),
  fecha: timestamp("fecha").defaultNow().notNull(),
  fechaFin: timestamp("fechaFin"),
  duracionMinutos: int("duracionMinutos"),
  completado: boolean("completado").default(false),
  volumenTotal: int("volumenTotal").default(0),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Workout = typeof workouts.$inferSelect;

// Series realizadas
export const setsDone = mysqlTable("sets_done", {
  id: serial("id").primaryKey(),
  workoutId: bigint("workoutId", { mode: "number", unsigned: true }).notNull().references(() => workouts.id),
  exerciseName: varchar("exerciseName", { length: 255 }).notNull(),
  setNumber: int("setNumber").default(1),
  pesoKg: float("pesoKg"),
  reps: int("reps"),
  rpe: int("rpe"),
  completado: boolean("completado").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SetDone = typeof setsDone.$inferSelect;

// Progreso corporal
export const bodyProgress = mysqlTable("body_progress", {
  id: serial("id").primaryKey(),
  profileId: bigint("profileId", { mode: "number", unsigned: true }).notNull().references(() => profiles.id),
  peso: float("peso"),
  grasaCorporal: float("grasaCorporal"),
  pecho: float("pecho"),
  cintura: float("cintura"),
  cadera: float("cadera"),
  biceps: float("biceps"),
  muslo: float("muslo"),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  fecha: timestamp("fecha").defaultNow().notNull(),
});

export type BodyProgress = typeof bodyProgress.$inferSelect;

// Rachas (streaks)
export const streaks = mysqlTable("streaks", {
  id: serial("id").primaryKey(),
  profileId: bigint("profileId", { mode: "number", unsigned: true }).notNull().references(() => profiles.id),
  currentStreak: int("currentStreak").default(0),
  longestStreak: int("longestStreak").default(0),
  lastWorkoutDate: timestamp("lastWorkoutDate"),
  weeklyGoal: int("weeklyGoal").default(4),
  weeklyCompleted: int("weeklyCompleted").default(0),
  weekStartDate: timestamp("weekStartDate"),
  tenantId: varchar("tenantId", { length: 100 }).default("default").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Streak = typeof streaks.$inferSelect;
