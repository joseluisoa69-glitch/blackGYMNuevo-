import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  Flame,
  Sparkles,
  Scan,
  Play,
  TrendingUp,
  CheckCircle,
  Clock,
  Dumbbell,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { data: streak } = trpc.streak.get.useQuery();
  const { data: routine } = trpc.routine.getActive.useQuery();
  const { data: history } = trpc.workout.history.useQuery({ limit: 5 });

  const today = new Date();
  const dayName = today.toLocaleDateString("es-ES", { weekday: "long" });
  const dateStr = today.toLocaleDateString("es-ES", { day: "numeric", month: "long" });

  const weeklyGoal = streak?.weeklyGoal || 4;
  const weeklyDone = streak?.weeklyCompleted || 0;
  const weeklyProgress = (weeklyDone / weeklyGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white capitalize">
          {dayName}, {dateStr}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {user?.name ? `Hola, ${user.name}` : "Bienvenido a BlackGYM"}
        </p>
      </div>

      {/* Streak Hero Banner */}
      {streak && (
        <div className="relative overflow-hidden rounded-2xl gradient-fire p-6">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-8 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 left-8 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          </div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                <Flame className="w-8 h-8 text-white animate-fire-pulse" />
              </div>
              <div>
                <div className="font-display text-4xl text-white">{streak.currentStreak || 0}</div>
                <div className="text-white/80 text-sm">Racha actual</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/80 text-xs mb-1">Meta semanal</div>
              <div className="font-display text-2xl text-white">{weeklyDone}/{weeklyGoal}</div>
              <div className="w-32 h-2 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${weeklyProgress}%` }}
                />
              </div>
            </div>
          </div>
          {(streak.currentStreak || 0) > 0 && (
            <p className="relative text-white/70 text-sm mt-4">
              Manten tu racha activa - Entrena hoy!
            </p>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Link
          to="/mirutina"
          className="flex flex-col items-center gap-2 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#FFD700]/30 transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-12 h-12 bg-[#FFD700]/10 border border-[#FFD700]/25 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-[#FFD700]" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">Mi Rutina</span>
        </Link>
        <Link
          to="/rutina"
          className="flex flex-col items-center gap-2 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#FFD700]/30 transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">Rutina AI</span>
        </Link>
        <Link
          to="/explorar"
          className="flex flex-col items-center gap-2 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#FFD700]/30 transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-12 h-12 bg-[#1E1E1E] rounded-xl flex items-center justify-center">
            <Scan className="w-6 h-6 text-[#FFD700]" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">Explorar</span>
        </Link>
        <Link
          to="/entrenar"
          className="flex flex-col items-center gap-2 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-green-500/30 transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
            <Play className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">Entrenar</span>
        </Link>
        <Link
          to="/progreso"
          className="flex flex-col items-center gap-2 p-4 bg-[#141414] border border-[#2A2A2A] rounded-2xl hover:border-[#FFD700]/30 transition-all hover:-translate-y-0.5 group"
        >
          <div className="w-12 h-12 bg-[#1E1E1E] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#FFD700]" />
          </div>
          <span className="text-sm font-medium text-white/70 group-hover:text-white">Progreso</span>
        </Link>
      </div>

      {/* Today's Workout */}
      {routine && (
        (() => {
          const completedCount = history?.filter((w) => w.completado).length || 0;
          const dayIdx = completedCount % (routine.days?.length || 1);
          const currentDay = routine.days?.[dayIdx];
          
          return currentDay ? (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#FFD700] uppercase tracking-wider">Próximo Entrenamiento</h2>
                  <h3 className="text-base font-bold text-white mt-0.5">{currentDay.nombreDia}</h3>
                  <p className="text-white/40 text-xs mt-0.5">{routine.nombre}</p>
                </div>
                <Link
                  to={`/entrenar?dayId=${currentDay.id}&dayName=${encodeURIComponent(currentDay.nombreDia)}`}
                  className="px-4 py-2 gradient-gold text-black text-xs font-bold rounded-xl hover:brightness-110 transition-all"
                >
                  Comenzar
                </Link>
              </div>
              <div className="divide-y divide-[#2A2A2A]">
                {(currentDay.exercises || []).slice(0, 5).map((ex: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg flex items-center justify-center text-[10px] text-white/50 font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white">{ex.nombre}</p>
                        <p className="text-[10px] text-white/40 capitalize">{ex.grupoMuscular}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-2.5 py-0.5 rounded-full font-bold">
                      {ex.series}x{ex.repeticiones}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()
      )}

      {!routine && (
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 text-center">
          <Dumbbell className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">Sin rutina activa</h3>
          <p className="text-white/50 text-sm mb-4">Genera tu primera rutina con IA</p>
          <Link
            to="/rutina"
            className="inline-flex items-center gap-2 px-6 py-3 gradient-gold text-black font-bold rounded-xl hover:brightness-110 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generar Rutina
          </Link>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Actividad Reciente</h2>
          <Link to="/progreso" className="text-[#FFD700] text-sm flex items-center gap-1 hover:underline">
            Ver todo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {history && history.length > 0 ? (
          <div className="space-y-2">
            {history.map((workout: any) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-4 bg-[#141414] border border-[#2A2A2A] rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {workout.completado ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-white/30" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{workout.diaNombre || "Entrenamiento"}</p>
                    <p className="text-xs text-white/40">
                      {new Date(workout.fecha).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {workout.duracionMinutos && (
                    <span className="text-xs text-white/50">{workout.duracionMinutos} min</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#141414] border border-[#2A2A2A] rounded-xl">
            <p className="text-white/30 text-sm">Sin entrenamientos recientes</p>
            <Link to="/entrenar" className="text-[#FFD700] text-sm mt-2 inline-block hover:underline">
              Empieza hoy
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
