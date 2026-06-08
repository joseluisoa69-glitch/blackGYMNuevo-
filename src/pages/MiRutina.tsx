import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import {
  Sparkles,
  Calendar,
  Clock,
  Zap,
  Dumbbell,
  X,
  Play,
  ArrowRight,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MiRutina() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  // Queries for active routine and workout history to determine next day to train
  const { data: routine, isLoading } = trpc.routine.getActive.useQuery();
  const { data: history } = trpc.workout.history.useQuery({ limit: 10 });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full" />
          <p className="text-white/40 text-xs">Cargando tu rutina activa...</p>
        </div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
        <Dumbbell className="w-16 h-16 text-white/10 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white mb-2">No tienes una rutina activa</h2>
        <p className="text-white/55 text-sm mb-6 leading-relaxed">
          Para ver tus días de entrenamiento y empezar a registrar tus series, necesitas configurar tu perfil y generar un plan con nuestro entrenador AI.
        </p>
        <button
          onClick={() => navigate("/rutina")}
          className="px-6 py-3 gradient-gold text-black font-bold rounded-xl flex items-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          Generar Rutina AI
        </button>
      </div>
    );
  }

  // Determine current day based on history
  const completedWorkoutsCount = history?.filter((w) => w.completado).length || 0;
  const currentDayIndex = completedWorkoutsCount % (routine.days?.length || 1);

  const parsedDiet = (() => {
    if (!routine?.dieta) return null;
    try {
      return typeof routine.dieta === "string" ? JSON.parse(routine.dieta) : routine.dieta;
    } catch (err) {
      console.error("Could not parse diet plan from routine:", err);
      return null;
    }
  })();

  // Get muscle group emojis for display on the cards
  const getGroupEmoji = (grupo: string): string => {
    const g = grupo.toLowerCase();
    if (g.includes("pecho") || g.includes("chest")) return "💪";
    if (g.includes("espalda") || g.includes("back")) return "🏋️";
    if (g.includes("pierna") || g.includes("leg") || g.includes("cuadri") || g.includes("femo")) return "🦵";
    if (g.includes("hombro") || g.includes("shoulder")) return "🛡️";
    if (g.includes("brazo") || g.includes("bicep") || g.includes("tricep")) return "🦾";
    if (g.includes("glute") || g.includes("glút")) return "🍑";
    if (g.includes("abs") || g.includes("core") || g.includes("abdom")) return "🧎";
    return "⚡";
  };

  const handleStartWorkout = (day: any) => {
    // Navigate to Entrenar page passing selected routine day parameters
    navigate(`/entrenar?dayId=${day.id}&dayName=${encodeURIComponent(day.nombreDia)}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Info */}
      <div className="bg-gradient-to-br from-[#141414] to-[#0D0D0D] border border-[#2A2A2A] rounded-3xl p-6 relative overflow-hidden">
        {/* Decorative gold backdrop glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-[2px] text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2.5 py-1 rounded-full">
                Plan Activo
              </span>
              {routine.nivelRPE && (
                <span className="text-[10px] uppercase font-bold tracking-[2px] text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  RPE {routine.nivelRPE}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{routine.nombre}</h1>
            <p className="text-white/55 text-sm mt-2 leading-relaxed max-w-2xl">{routine.descripcion}</p>
          </div>
          <button
            onClick={() => navigate("/rutina")}
            className="flex-shrink-0 px-4 py-2.5 bg-[#1C1C1C] border border-[#2A2A2A] text-white/70 hover:text-white rounded-xl text-xs font-bold transition-all hover:border-[#FFD700]/30 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Nueva Rutina
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#2A2A2A]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]">
              <Calendar className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase font-semibold">Frecuencia</div>
              <div className="text-sm font-bold text-white">{routine.diasPorSemana} días / sem</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]">
              <Clock className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase font-semibold">Sesión Prom.</div>
              <div className="text-sm font-bold text-white">{routine.tiempoSesionMinutos || 60} mins</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center border border-[#2A2A2A]">
              <Zap className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase font-semibold">Intensidad</div>
              <div className="text-sm font-bold text-white">RPE {routine.nivelRPE || 7}</div>
            </div>
          </div>
        </div>
      </div>

      {parsedDiet && (
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[2px] text-[#FFD700] font-bold mb-2">Plan Nutricional</p>
              <h2 className="text-xl font-bold text-white">Tu Dieta Personalizada</h2>
              <p className="text-sm text-white/50 mt-1 leading-relaxed">
                Basada en tus objetivos, calorías meta y preferencias alimentarias.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-[#1E1E1E] p-3 border border-[#2A2A2A]">
                <p className="text-[10px] uppercase text-white/40 tracking-[2px]">Calorías</p>
                <p className="text-lg font-bold text-white mt-2">{parsedDiet.caloriasDiarias}</p>
              </div>
              <div className="rounded-2xl bg-[#1E1E1E] p-3 border border-[#2A2A2A]">
                <p className="text-[10px] uppercase text-white/40 tracking-[2px]">Proteínas</p>
                <p className="text-lg font-bold text-white mt-2">{parsedDiet.macros.proteinas}g</p>
              </div>
              <div className="rounded-2xl bg-[#1E1E1E] p-3 border border-[#2A2A2A]">
                <p className="text-[10px] uppercase text-white/40 tracking-[2px]">Carbs / Grasas</p>
                <p className="text-sm text-white/70 mt-2 leading-tight">
                  {parsedDiet.macros.carbohidratos}g / {parsedDiet.macros.grasas}g
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {parsedDiet.comidas?.map((meal: any, index: number) => (
              <div key={index} className="rounded-3xl border border-[#2A2A2A] bg-[#0E0E0E] p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-bold text-white">{meal.nombre}</h3>
                  <span className="text-[10px] uppercase tracking-[2px] text-white/40">{meal.calorias} kcal</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-3">{meal.descripcion}</p>
                <div className="grid grid-cols-3 gap-2 text-[10px] uppercase text-white/50">
                  <div className="rounded-2xl bg-[#141414] p-2 text-center">Proteínas<br /><span className="text-white font-bold">{meal.proteinas}g</span></div>
                  <div className="rounded-2xl bg-[#141414] p-2 text-center">Carbs<br /><span className="text-white font-bold">{meal.carbohidratos}g</span></div>
                  <div className="rounded-2xl bg-[#141414] p-2 text-center">Grasas<br /><span className="text-white font-bold">{meal.grasas}g</span></div>
                </div>
              </div>
            ))}
          </div>

          {parsedDiet.recomendaciones && (
            <div className="rounded-3xl border border-[#2A2A2A] bg-[#0E0E0E] p-4 text-sm text-white/70">
              <p className="font-semibold text-white mb-2">Recomendaciones:</p>
              <p>{parsedDiet.recomendaciones}</p>
            </div>
          )}
        </div>
      )}

      {/* Grid of Days */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Tus Días de Entrenamiento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {routine.days?.map((day: any, idx: number) => {
            const isTodayIndex = idx === currentDayIndex;
            const exercisesCount = day.exercises?.length || 0;
            const uniqueMuscles = Array.from(
              new Set(day.exercises?.map((e: any) => e.grupoMuscular || ""))
            ).filter(Boolean) as string[];

            return (
              <motion.button
                key={day.id}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => setSelectedDay(day)}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-48 relative overflow-hidden transition-all group ${
                  isTodayIndex
                    ? "border-[#FFD700] bg-[#FFD700]/5 shadow-[0_0_20px_rgba(255,215,0,0.05)]"
                    : "border-[#2A2A2A] bg-[#141414] hover:border-[#FFD700]/30"
                }`}
              >
                {isTodayIndex && (
                  <div className="absolute top-4 right-4 bg-[#FFD700] text-black text-[9px] uppercase tracking-[1px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Flame className="w-2.5 h-2.5 fill-black" />
                    Toca Hoy
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1">
                    Día {day.orden}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight group-hover:text-[#FFD700] transition-colors line-clamp-1">
                    {day.nombreDia.replace(/^Día \d+:\s*/i, "")}
                  </h3>

                  {/* Muscle Indicators */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {uniqueMuscles.slice(0, 3).map((musc, mIdx) => (
                      <span
                        key={mIdx}
                        className="text-[9px] font-bold text-white/60 bg-[#1E1E1E] border border-[#2A2A2A] px-2 py-0.5 rounded-full flex items-center gap-1"
                      >
                        <span>{getGroupEmoji(musc)}</span>
                        <span>{musc}</span>
                      </span>
                    ))}
                    {uniqueMuscles.length > 3 && (
                      <span className="text-[9px] text-white/40 px-1 py-0.5">
                        +{uniqueMuscles.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2A2A2A]/40 w-full text-xs text-white/40 font-semibold">
                  <span>{exercisesCount} ejercicios</span>
                  <span className="flex items-center gap-1 group-hover:text-white transition-colors">
                    Ver detalle <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Drawer Overlay for Day Details */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setSelectedDay(null)} />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-[#0F0F0F] border-t border-[#2A2A2A] w-full max-w-2xl rounded-t-[32px] p-6 max-h-[85vh] flex flex-col relative z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDay(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1E1E1E] border border-[#2A2A2A] flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Drawer Header */}
              <div className="mb-6 pr-8">
                <div className="text-[10px] text-[#FFD700] uppercase font-bold tracking-[2px] mb-1">
                  Detalles del Día {selectedDay.orden}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedDay.nombreDia}
                </h3>
                <p className="text-xs text-white/40 mt-1">
                  Revisa la lista de ejercicios antes de iniciar la sesión de entrenamiento.
                </p>
              </div>

              {/* Exercises List (Scrollable) */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-6 scrollbar-thin">
                {selectedDay.exercises && selectedDay.exercises.length > 0 ? (
                  selectedDay.exercises.map((ex: any, idx: number) => (
                    <div
                      key={ex.id}
                      className="p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl flex items-center justify-center text-xs font-bold text-white/50">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug">{ex.nombre}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] text-white/40 font-semibold">
                              {getGroupEmoji(ex.grupoMuscular || "")} {ex.grupoMuscular || "General"}
                            </span>
                            {ex.descansoSegundos && (
                              <>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="text-[10px] text-white/40 font-medium">
                                  ⏱️ {ex.descansoSegundos}s descanso
                                </span>
                              </>
                            )}
                          </div>
                          {ex.notas && (
                            <p className="text-[10px] text-[#FFD700]/70 italic mt-1 leading-normal">
                              📌 {ex.notas}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2.5 py-1 rounded-full">
                          {ex.series}s &times; {ex.repeticiones}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-white/30 text-xs">
                    No hay ejercicios cargados para este día.
                  </div>
                )}
              </div>

              {/* Bottom CTAs */}
              <div className="flex gap-3 border-t border-[#2A2A2A]/40 pt-4">
                <button
                  onClick={() => setSelectedDay(null)}
                  className="flex-1 h-13 border border-[#2A2A2A] text-white font-bold rounded-xl text-sm transition-all hover:bg-white/5"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleStartWorkout(selectedDay)}
                  className="flex-[2] h-13 gradient-gold text-black font-bold rounded-xl text-sm transition-all hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Iniciar Entrenamiento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
