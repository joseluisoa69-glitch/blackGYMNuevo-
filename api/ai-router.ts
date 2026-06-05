import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { routines, routineDays, exercises, profiles } from "@db/schema";
import { eq } from "drizzle-orm";

// Input schema matching the multisection wizard form
const generateRoutineInput = z.object({
  name: z.string(),
  edad: z.number(),
  pesoKg: z.number(),
  alturaCm: z.number(),
  genero: z.enum(["masculino", "femenino"]),
  porcentajeGrasa: z.number().optional().nullable(),
  tipoCuerpo: z.enum(["ectomorfo", "mesomorfo", "endomorfo"]),
  trabajo: z.enum(["sedentario", "fisico", "mixto"]),
  horasSueno: z.number(),
  nivelEstres: z.number(),
  comidasPorDia: z.enum(["1-2", "3", "4-5", "6+"]),
  gramosProteinaDiaria: z.number().optional().nullable(),
  experienciaPrevia: z.enum(["nunca", "<1 ano", "1-3 anos", ">3 anos"]),
  diasActuales: z.number(),
  cirugiasPrevias: z.string().optional().nullable(),
  enfermedadesCronicas: z.string().optional().nullable(),
  medicamentos: z.string().optional().nullable(),
  doloresPersistentes: z.string().optional().nullable(),
  lesiones: z.string().optional().nullable(),
  objetivoPrincipal: z.enum(["perder_peso", "ganar_musculo", "mantener", "fuerza", "resistencia"]),
  metaEspecifica: z.string(),
  tiempoMeta: z.number(),
  accesoGym: z.enum(["gym_completo", "mancuernas_casa", "bandas", "calistenia"]),
  musculosPrioridad: z.array(z.string()),
  ejerciciosFavoritos: z.string().optional().nullable(),
  ejerciciosOdiados: z.string().optional().nullable(),
  diasPorSemana: z.number(),
  tiempoSesion: z.number(),
  notasAdicionales: z.string().optional().nullable(),
});

// Validation schema for DeepSeek JSON response
const generatedExerciseSchema = z.object({
  nombre: z.string(),
  grupoMuscular: z.string(),
  series: z.number(),
  repeticiones: z.string(),
  descansoSegundos: z.number(),
  notas: z.string().optional().nullable(),
  orden: z.number(),
});

const generatedDaySchema = z.object({
  nombreDia: z.string(),
  orden: z.number(),
  ejercicios: z.array(generatedExerciseSchema),
});

const generatedRoutineSchema = z.object({
  nombre: z.string(),
  descripcion: z.string(),
  diasPorSemana: z.number(),
  tiempoSesionMinutos: z.number(),
  nivelRPE: z.number(),
  days: z.array(generatedDaySchema),
});

export const aiRouter = createRouter({
  generateRoutine: authedQuery
    .input(generateRoutineInput)
    .mutation(async ({ ctx, input }) => {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error("DEEPSEEK_API_KEY environment variable is not configured.");
      }

      // 1. Build detail-oriented prompt with constraints
      const prompt = `
Eres un entrenador personal profesional de élite con 20 años de experiencia diseñando rutinas de entrenamiento científicas y sumamente personalizadas.
Por favor crea una rutina detallada basada exactamente en el siguiente perfil de usuario:

INFORMACIÓN DEL USUARIO:
- Nombre: ${input.name}
- Edad: ${input.edad} años
- Peso: ${input.pesoKg} kg
- Altura: ${input.alturaCm} cm
- Género: ${input.genero}
- % de Grasa Corporal: ${input.porcentajeGrasa ?? "No especificado"}%
- Tipo de cuerpo: ${input.tipoCuerpo}

ESTILO DE VIDA:
- Trabajo: Actividad tipo ${input.trabajo}
- Horas de sueño promedio: ${input.horasSueno} horas
- Nivel de estrés: ${input.nivelEstres}/10
- Comidas al día: ${input.comidasPorDia}
- Gramos proteína diaria: ${input.gramosProteinaDiaria ?? "No especificado"}g

HISTORIAL Y LESIONES:
- Experiencia previa: ${input.experienciaPrevia}
- Días actuales de entrenamiento: ${input.diasActuales} días/semana
- Cirugías previas: ${input.cirugiasPrevias ?? "Ninguna"}
- Enfermedades crónicas: ${input.enfermedadesCronicas ?? "Ninguna"}
- Medicamentos: ${input.medicamentos ?? "Ninguno"}
- Dolores persistentes: ${input.doloresPersistentes ?? "Ninguno"}
- Lesiones o limitaciones: ${input.lesiones ?? "Ninguna"}

METAS Y PREFERENCIAS:
- Objetivo principal: ${input.objetivoPrincipal}
- Meta específica: ${input.metaEspecifica}
- Plazo de tiempo para la meta: ${input.tiempoMeta} semanas
- Acceso a equipamiento (Gym): ${input.accesoGym}
- Músculos con prioridad: ${input.musculosPrioridad.join(", ")}
- Ejercicios favoritos (incluir siempre que sea posible): ${input.ejerciciosFavoritos ?? "Ninguno"}
- Ejercicios odiados/evitar: ${input.ejerciciosOdiados ?? "Ninguno"}
- Días de entrenamiento solicitados: ${input.diasPorSemana} días/semana
- Duración por sesión solicitada: ${input.tiempoSesion} minutos
- Notas adicionales: ${input.notasAdicionales ?? "Ninguna"}

RESTRICCIONES Y ADAPTACIONES OBLIGATORIAS:
1. Horas de sueño < 6 horas: Forzar máximo 3 días de entrenamiento a la semana, con sesiones de no más de 45 minutos para maximizar la recuperación.
2. Nivel de estrés > 7: Limitar el nivel de RPE a 6-7 máximo. Agregar notas de movilidad y ejercicios de baja fatiga para evitar sobreentrenamiento.
3. Experiencia = "nunca": Limitar series a un máximo de 2 series de trabajo efectivo por ejercicio, planteando una progresión simple cada 3 semanas.
4. Tipo de cuerpo = "endomorfo": Incorporar superseries/supersets y prescribir una recomendación de entrenamiento de intervalos (HIIT) de 10 minutos post-entreno en las notas de los días.
5. Si reporta lesiones o dolores: Evitar estrictamente ejercicios que carguen de forma directa esas zonas lesionadas (ej. no sentadillas con barra libre si hay dolor lumbar, usar prensa).
6. Respetar al 100% los ejercicios odiados (no incluirlos jamás) y favorecer los ejercicios favoritos si son coherentes con el acceso a equipamiento y lesiones.
7. El equipamiento disponible limita estrictamente los ejercicios (ej. "calistenia" solo admite peso corporal, "mancuernas_casa" solo mancuernas, etc.).

DEVUELVE EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON EL SIGUIENTE FORMATO (No agregues textos explicativos, saludos ni bloques Markdown de tipo \`\`\`json):
{
  "nombre": "Nombre motivador y profesional para la rutina",
  "descripcion": "Explicación detallada de la estrategia de la rutina adaptada a su caso particular y restricciones de salud/sueño/estrés",
  "diasPorSemana": ${input.diasPorSemana},
  "tiempoSesionMinutos": ${input.tiempoSesion},
  "nivelRPE": Rango sugerido de RPE (ej. 7 u 8),
  "days": [
    {
      "nombreDia": "Día 1: Nombre del Split (ej. Empuje)",
      "orden": 1,
      "ejercicios": [
        {
          "nombre": "Nombre del Ejercicio",
          "grupoMuscular": "Grupo Muscular principal (ej. Pecho)",
          "series": 3,
          "repeticiones": "Rango de reps (ej. 8-12)",
          "descansoSegundos": 90,
          "notas": "Notas técnicas (ej. Mantener el core apretado, evitar arquear)",
          "orden": 1
        }
      ]
    }
  ]
}
      `.trim();

      // 2. Call DeepSeek API
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "Eres un entrenador personal experto de BlackGYM que genera rutinas en formato JSON estricto.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API error response:", errorText);
        throw new Error(`DeepSeek API returned status ${response.status}: ${errorText}`);
      }

      const responseData = (await response.json()) as any;
      const rawText = responseData.choices?.[0]?.message?.content;

      if (!rawText) {
        throw new Error("DeepSeek response empty or invalid choices.");
      }

      // Clean markdown structures if any
      let cleanJsonText = rawText.trim();
      if (cleanJsonText.startsWith("```json")) {
        cleanJsonText = cleanJsonText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (cleanJsonText.startsWith("```")) {
        cleanJsonText = cleanJsonText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      // 3. Parse and validate using Zod
      let generatedData: z.infer<typeof generatedRoutineSchema>;
      try {
        const parsed = JSON.parse(cleanJsonText);
        generatedData = generatedRoutineSchema.parse(parsed);
      } catch (err) {
        console.error("DeepSeek response raw text:", rawText);
        console.error("Parse or validation error:", err);
        throw new Error("Failed to parse and validate AI-generated routine. Please try again.");
      }

      // 4. Save to database using Drizzle
      const db = getDb();
      const tenantId = ctx.user.tenantId || "default";

      // Look up profile for the user
      const existingProfiles = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, ctx.user.id))
        .limit(1);

      const profileValues = {
        userId: ctx.user.id,
        nombre: input.name,
        pesoKg: input.pesoKg,
        alturaCm: input.alturaCm,
        genero: input.genero,
        objetivo: input.objetivoPrincipal,
        nivel:
          input.experienciaPrevia === "nunca" || input.experienciaPrevia === "<1 ano"
            ? "principiante" as const
            : "intermedio" as const,
        diasSemana: input.diasPorSemana,
        tiempoSesion: input.tiempoSesion,
        lesiones: input.lesiones || null,
        notas: input.notasAdicionales || null,
        tenantId,
        
        // Advanced details
        porcentajeGrasa: input.porcentajeGrasa || null,
        tipoCuerpo: input.tipoCuerpo,
        trabajo: input.trabajo,
        horasSueno: input.horasSueno,
        nivelEstres: input.nivelEstres,
        comidasPorDia: input.comidasPorDia,
        gramosProteinaDiaria: input.gramosProteinaDiaria || null,
        experienciaPrevia: input.experienciaPrevia,
        frecuenciaActual: input.diasActuales,
        cirugiasPrevias: input.cirugiasPrevias || null,
        enfermedadesCronicas: input.enfermedadesCronicas || null,
        medicamentos: input.medicamentos || null,
        doloresPersistentes: input.doloresPersistentes || null,
        metaEspecifica: input.metaEspecifica,
        tiempoMeta: input.tiempoMeta,
        accesoGym: input.accesoGym,
        musculosPrioridad: input.musculosPrioridad.join(","),
        ejerciciosFavoritos: input.ejerciciosFavoritos || null,
        ejerciciosOdiados: input.ejerciciosOdiados || null,
      };

      let resolvedProfileId: number;

      if (existingProfiles[0]) {
        resolvedProfileId = existingProfiles[0].id;
        await db.update(profiles).set(profileValues).where(eq(profiles.id, resolvedProfileId));
      } else {
        const insResult = await db.insert(profiles).values(profileValues);
        resolvedProfileId = Number(insResult[0].insertId);
      }

      // Deactivate all active routines for this profile
      await db
        .update(routines)
        .set({ activa: false })
        .where(eq(routines.profileId, resolvedProfileId));

      // Insert new routine
      const routineResult = await db.insert(routines).values({
        profileId: resolvedProfileId,
        nombre: generatedData.nombre,
        descripcion: generatedData.descripcion,
        diasPorSemana: generatedData.diasPorSemana,
        activa: true,
        source: "ai",
        tiempoSesionMinutos: generatedData.tiempoSesionMinutos,
        nivelRPE: generatedData.nivelRPE,
        tenantId,
      });

      const routineId = Number(routineResult[0].insertId);

      // Insert routine days and exercises
      for (const day of generatedData.days) {
        const dayResult = await db.insert(routineDays).values({
          routineId,
          nombreDia: day.nombreDia,
          orden: day.orden,
          tenantId,
        });

        const dayId = Number(dayResult[0].insertId);

        for (const ej of day.ejercicios) {
          await db.insert(exercises).values({
            dayId,
            nombre: ej.nombre,
            grupoMuscular: ej.grupoMuscular,
            series: ej.series,
            repeticiones: ej.repeticiones,
            descansoSegundos: ej.descansoSegundos,
            notas: ej.notas || "",
            orden: ej.orden,
            tenantId,
          });
        }
      }

      return {
        id: routineId,
        nombre: generatedData.nombre,
        descripcion: generatedData.descripcion,
        diasPorSemana: generatedData.diasPorSemana,
        tiempoSesionMinutos: generatedData.tiempoSesionMinutos,
        nivelRPE: generatedData.nivelRPE,
        days: generatedData.days,
      };
    }),
});
