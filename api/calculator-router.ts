import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

export const calculatorRouter = createRouter({
  oneRM: publicQuery.input(z.object({
    peso: z.number(),
    reps: z.number(),
  })).query(({ input }) => {
    const { peso, reps } = input;
    // Formula de Epley
    const rm = peso * (1 + reps / 30);
    return {
      rm1: Math.round(rm),
      rm3: Math.round(rm * 0.93),
      rm5: Math.round(rm * 0.87),
      rm8: Math.round(rm * 0.80),
      rm10: Math.round(rm * 0.75),
      rm12: Math.round(rm * 0.70),
    };
  }),

  tdee: publicQuery.input(z.object({
    peso: z.number(),
    altura: z.number(),
    edad: z.number(),
    genero: z.enum(["masculino", "femenino"]),
    actividad: z.enum(["sedentario", "ligero", "moderado", "intenso", "muy_intenso"]),
  })).query(({ input }) => {
    const { peso, altura, edad, genero, actividad } = input;
    let bmr: number;
    if (genero === "masculino") {
      bmr = (10 * peso) + (6.25 * altura) - (5 * edad) + 5;
    } else {
      bmr = (10 * peso) + (6.25 * altura) - (5 * edad) - 161;
    }

    const multiplicadores: Record<string, number> = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muy_intenso: 1.9,
    };

    const tdee = Math.round(bmr * (multiplicadores[actividad] || 1.55));

    return {
      bmr: Math.round(bmr),
      tdee,
      perderPeso: tdee - 500,
      ganarPeso: tdee + 500,
    };
  }),

  macros: publicQuery.input(z.object({
    tdee: z.number(),
    objetivo: z.enum(["perder_peso", "ganar_musculo", "mantener"]),
  })).query(({ input }) => {
    const { tdee, objetivo } = input;
    let proteinas: number, grasas: number, carbs: number;

    if (objetivo === "perder_peso") {
      proteinas = Math.round(tdee * 0.40 / 4);
      grasas = Math.round(tdee * 0.30 / 9);
      carbs = Math.round(tdee * 0.30 / 4);
    } else if (objetivo === "ganar_musculo") {
      proteinas = Math.round(tdee * 0.30 / 4);
      grasas = Math.round(tdee * 0.25 / 9);
      carbs = Math.round(tdee * 0.45 / 4);
    } else {
      proteinas = Math.round(tdee * 0.30 / 4);
      grasas = Math.round(tdee * 0.30 / 9);
      carbs = Math.round(tdee * 0.40 / 4);
    }

    return { proteinas, grasas, carbs };
  }),
});
