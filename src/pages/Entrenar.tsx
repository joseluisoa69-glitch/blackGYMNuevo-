import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useStore } from "@/store/useStore";
import {
  Play,
  Pause,
  Square,
  Check,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Flame,
  Clock,
  Dumbbell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Entrenar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dayIdParam = searchParams.get("dayId");

  const { activeWorkout, setActiveWorkout } = useStore();
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [setsData, setSetsData] = useState<Record<string, any>>({});
  const [exerciseSetCounts, setExerciseSetCounts] = useState<Record<number, number>>({});
  
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [restTarget, setRestTarget] = useState(60);
  
  const [showComplete, setShowComplete] = useState(false);
  const [workoutResult, setWorkoutResult] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: routine, isLoading: loadingRoutine } = trpc.routine.getActive.useQuery();
  const startWorkout = trpc.workout.start.useMutation();
  const logSet = trpc.workout.logSet.useMutation();
  const completeWorkout = trpc.workout.complete.useMutation();

  // Load day index from search parameters if specified
  useEffect(() => {
    if (routine?.days && dayIdParam) {
      const idx = routine.days.findIndex((d: any) => d.id === Number(dayIdParam));
      if (idx !== -1) {
        setSelectedDayIdx(idx);
      }
    }
  }, [routine, dayIdParam]);

  // Set up timer
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // Set up rest timer countdown
  useEffect(() => {
    if (showRestTimer && restSeconds > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestSeconds((s) => {
          if (s <= 1) {
            setShowRestTimer(false);
            if (restIntervalRef.current) clearInterval(restIntervalRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (!showRestTimer && restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [showRestTimer, restSeconds]);

  const currentDay = routine?.days?.[selectedDayIdx];
  const exercises = currentDay?.exercises || [];
  const currentExercise = exercises[currentExerciseIdx];

  const getSetCount = (exIdx: number) => {
    return exerciseSetCounts[exIdx] || exercises[exIdx]?.series || 3;
  };

  const handleAddSet = (exIdx: number) => {
    setExerciseSetCounts((prev) => ({
      ...prev,
      [exIdx]: getSetCount(exIdx) + 1,
    }));
  };

  const handleRemoveSet = (exIdx: number) => {
    const currentSets = getSetCount(exIdx);
    if (currentSets <= 1) return;
    setExerciseSetCounts((prev) => ({
      ...prev,
      [exIdx]: currentSets - 1,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = async () => {
    if (!routine || !currentDay) return;
    try {
      const workout = await startWorkout.mutateAsync({
        routineId: routine.id,
        diaNombre: currentDay.nombreDia,
      });
      setActiveWorkout({
        id: workout.id,
        startTime: new Date(),
        routineName: routine.nombre,
        diaNombre: currentDay.nombreDia,
      });
      setIsActive(true);
      setElapsedSeconds(0);
      setSetsData({});
      setExerciseSetCounts({});
      setCurrentExerciseIdx(0);
    } catch (error) {
      console.error("Error starting workout:", error);
    }
  };

  const handleLogSet = async (setNum: number, peso: number, reps: number) => {
    if (!activeWorkout || !currentExercise) return;
    try {
      await logSet.mutateAsync({
        workoutId: activeWorkout.id,
        exerciseName: currentExercise.nombre,
        setNumber: setNum,
        pesoKg: peso,
        reps,
      });

      const key = `${currentExerciseIdx}-${setNum}`;
      setSetsData((prev) => ({
        ...prev,
        [key]: { peso, reps, done: true },
      }));

      // Trigger Rest timer
      const restTargetTime = currentExercise.descansoSegundos || 60;
      setRestTarget(restTargetTime);
      setRestSeconds(restTargetTime);
      setShowRestTimer(true);
    } catch (error) {
      console.error("Error logging set:", error);
    }
  };

  const handleFinish = async () => {
    if (!activeWorkout) return;
    setIsActive(false);

    const duracion = Math.round(elapsedSeconds / 60);
    const volumen = Object.values(setsData).reduce(
      (sum: number, s: any) => sum + (s?.peso || 0) * (s?.reps || 0),
      0
    );

    try {
      const result = await completeWorkout.mutateAsync({
        workoutId: activeWorkout.id,
        duracionMinutos: duracion || 1,
        volumenTotal: volumen,
      });

      setWorkoutResult(result);
      setShowComplete(true);
      setActiveWorkout(null);
    } catch (error) {
      console.error("Error completing workout:", error);
    }
  };

  const progress = exercises.length > 0 ? ((currentExerciseIdx + 1) / exercises.length) * 100 : 0;

  if (loadingRoutine) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
        <Trophy className="w-16 h-16 text-white/10 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sin rutina activa</h2>
        <p className="text-white/50 text-sm mb-6 leading-relaxed">
          No hemos encontrado un plan activo. Dirígete al creador AI de rutinas para estructurar tu entrenamiento.
        </p>
        <button
          onClick={() => navigate("/rutina")}
          className="px-6 py-3 gradient-gold text-black font-bold rounded-xl active:scale-[0.98] transition-all"
        >
          Crear Rutina AI
        </button>
      </div>
    );
  }

  if (!activeWorkout) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-black text-white">Preparar Entrenamiento</h1>
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-6 space-y-6 shadow-xl">
          {/* Day selection dropdown */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">
              Seleccionar Día de Entrenamiento
            </label>
            <select
              value={selectedDayIdx}
              onChange={(e) => setSelectedDayIdx(parseInt(e.target.value))}
              className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white focus:border-[#FFD700] focus:outline-none transition-colors text-sm font-semibold cursor-pointer"
            >
              {routine.days?.map((day: any, idx: number) => (
                <option key={day.id} value={idx}>
                  Día {day.orden}: {day.nombreDia.replace(/^Día \d+:\s*/i, "")}
                </option>
              ))}
            </select>
          </div>

          {currentDay && (
            <div className="space-y-4">
              <div className="border-b border-[#2A2A2A] pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {currentDay.nombreDia}
                  </h2>
                  <p className="text-xs text-white/40 mt-1">{routine.nombre}</p>
                </div>
                <span className="text-xs font-bold text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1 rounded-full">
                  {exercises.length} Ejercicios
                </span>
              </div>

              {/* Exercises Preview List */}
              <div className="space-y-2">
                {exercises.map((ex: any, i: number) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-3 py-2 px-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]/40"
                  >
                    <span className="w-6 h-6 bg-[#252525] rounded-lg flex items-center justify-center text-[10px] font-bold text-white/50">
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">{ex.nombre}</span>
                      <span className="text-[10px] text-white/40 block leading-none mt-0.5 capitalize">
                        {ex.grupoMuscular || "Fuerza"}
                      </span>
                    </div>
                    <span className="text-xs text-[#FFD700] font-bold ml-auto bg-[#FFD700]/5 px-2.5 py-0.5 rounded border border-[#FFD700]/10">
                      {ex.series} &times; {ex.repeticiones}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={startWorkout.isPending}
            className="w-full h-14 gradient-gold text-black font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#FFD700]/5"
          >
            <Play className="w-5 h-5 fill-black" />
            {startWorkout.isPending ? "Preparando..." : "Comenzar Entrenamiento"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Active Workout Header */}
      <div className="flex items-center justify-between bg-[#141414] border border-[#2A2A2A] rounded-3xl p-5 shadow-lg">
        <div>
          <p className="text-[10px] text-[#FFD700] uppercase font-bold tracking-wider">
            Sesión en Progreso
          </p>
          <h2 className="text-base font-bold text-white mt-0.5">{activeWorkout.diaNombre}</h2>
          <p className="text-[10px] text-white/40">{activeWorkout.routineName}</p>
        </div>
        <div className="text-right flex items-center gap-3">
          <div className="font-display text-2xl font-black text-[#FFD700] tracking-wide">
            {formatTime(elapsedSeconds)}
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-10 h-10 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl flex items-center justify-center text-white hover:text-[#FFD700] hover:border-[#FFD700]/30 transition-all active:scale-[0.97]"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider px-1">
          <span>Progreso de ejercicios</span>
          <span>
            {currentExerciseIdx + 1} de {exercises.length}
          </span>
        </div>
        <div className="h-2 bg-[#1A1A1A] border border-[#2A2A2A]/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD700] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Exercise Tracking */}
      {currentExercise && (
        <motion.div
          key={currentExerciseIdx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-6 space-y-5 shadow-lg relative"
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#FFD700] bg-[#FFD700]/10 border border-[#FFD700]/25 px-2.5 py-0.5 rounded-full">
                Ejercicio {currentExerciseIdx + 1}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full capitalize">
                {currentExercise.grupoMuscular || "Fuerza"}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white leading-tight">{currentExercise.nombre}</h3>
            {currentExercise.notas && (
              <p className="text-[11px] text-white/50 bg-[#1E1E1E] p-2.5 rounded-xl border border-[#2A2A2A]/40 mt-2 leading-relaxed">
                <span className="font-bold text-[#FFD700]">Guía:</span> {currentExercise.notas}
              </p>
            )}
          </div>

          {/* Sets Logging Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-[10px] text-white/30 uppercase tracking-wider font-bold px-3 py-1">
              <span className="col-span-2">Serie</span>
              <span className="col-span-3 text-center">Objetivo</span>
              <span className="col-span-3 text-center">Peso (kg)</span>
              <span className="col-span-2 text-center">Reps</span>
              <span className="col-span-2 text-right">Log</span>
            </div>

            <div className="space-y-2">
              {Array.from({ length: getSetCount(currentExerciseIdx) }).map((_, setIdx) => {
                const setNum = setIdx + 1;
                const key = `${currentExerciseIdx}-${setNum}`;
                const logged = !!setsData[key]?.done;
                return (
                  <SetRow
                    key={key}
                    setNumber={setNum}
                    objective={currentExercise.repeticiones || "8-12"}
                    isLogged={logged}
                    initialWeight={setsData[key]?.peso}
                    initialReps={setsData[key]?.reps}
                    onLog={(peso, reps) => handleLogSet(setNum, peso, reps)}
                  />
                );
              })}
            </div>
          </div>

          {/* Dynamic Set Manager Buttons */}
          <div className="flex gap-2 justify-end pt-2 border-t border-[#2A2A2A]/30">
            <button
              onClick={() => handleRemoveSet(currentExerciseIdx)}
              disabled={getSetCount(currentExerciseIdx) <= 1}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-[10px] font-bold text-white/50 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
              Eliminar Serie
            </button>
            <button
              onClick={() => handleAddSet(currentExerciseIdx)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl text-[10px] font-bold text-[#FFD700] hover:bg-[#FFD700]/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Serie
            </button>
          </div>
        </motion.div>
      )}

      {/* Exercises Navigation Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentExerciseIdx((i) => Math.max(0, i - 1))}
          disabled={currentExerciseIdx === 0}
          className="flex-1 h-12 bg-[#141414] border border-[#2A2A2A] rounded-xl text-white/50 hover:text-white disabled:opacity-25 transition-all flex items-center justify-center gap-2 text-xs font-bold active:scale-[0.98]"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {currentExerciseIdx < exercises.length - 1 ? (
          <button
            onClick={() => setCurrentExerciseIdx((i) => i + 1)}
            className="flex-1 h-12 bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={completeWorkout.isPending}
            className="flex-1 h-12 gradient-gold text-black rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg shadow-[#FFD700]/5"
          >
            <Square className="w-4 h-4 fill-black" />
            Finalizar Entrenamiento
          </button>
        )}
      </div>

      {/* CountDown Rest Timer Modal */}
      <AnimatePresence>
        {showRestTimer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#141414] border border-[#FFD700]/25 rounded-[32px] p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl"
            >
              {/* Outer decorative ring */}
              <div className="w-36 h-36 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                {/* Countdown display */}
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold tracking-[2px] text-white/40 block mb-1">
                    Recuperación
                  </span>
                  <span className="font-display text-5xl font-black text-[#FFD700] tracking-tight block">
                    {restSeconds}s
                  </span>
                </div>
              </div>

              {/* Progress Slider mimic */}
              <div className="w-full h-1 bg-[#1A1A1A] rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-[#FFD700]"
                  style={{ width: `${((restTarget - restSeconds) / restTarget) * 100}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>

              <div className="flex gap-2 justify-center mb-6 flex-wrap">
                {[30, 45, 60, 90, 120].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setRestSeconds(s);
                      setRestTarget(s);
                    }}
                    className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                      restTarget === s
                        ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                        : "border-[#2A2A2A] bg-[#1E1E1E] text-white/50 hover:text-white"
                    }`}
                  >
                    +{s}s
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowRestTimer(false)}
                className="w-full h-12 bg-[#1E1E1E] border border-[#2A2A2A] hover:text-white text-white/60 font-bold rounded-xl text-xs transition-colors"
              >
                Saltar descanso
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {showComplete && workoutResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-[#141414] border border-[#FFD700]/30 rounded-[36px] p-8 max-w-sm w-full text-center shadow-2xl relative"
            >
              {/* Confetti decoration / Golden light */}
              <div className="absolute inset-0 bg-[#FFD700]/5 filter blur-3xl pointer-events-none rounded-full" />

              <div className="w-20 h-20 bg-[#FFD700]/10 border border-[#FFD700]/35 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-[#FFD700]" />
              </div>

              <h2 className="text-2xl font-black text-white leading-tight">Sesión Completada!</h2>
              <p className="text-white/50 text-xs mt-1.5">Has entrenado con constancia.</p>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-sm font-bold text-[#FFD700] bg-[#FFD700]/5 border border-[#FFD700]/15 py-1 px-3 rounded-full w-max mx-auto">
                <Flame className="w-4 h-4 fill-[#FFD700]" />
                Racha actual: {workoutResult.streak || 1} días
              </div>

              {/* Stats Summary Table */}
              <div className="grid grid-cols-3 gap-3 my-6">
                <div className="bg-[#1E1E1E] border border-[#2A2A2A]/40 rounded-2xl p-3 text-center">
                  <Clock className="w-4 h-4 text-white/20 mx-auto mb-1" />
                  <div className="font-display text-base font-black text-white leading-tight">
                    {Math.round(elapsedSeconds / 60) || 1}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-white/30">Mins</span>
                </div>
                <div className="bg-[#1E1E1E] border border-[#2A2A2A]/40 rounded-2xl p-3 text-center">
                  <Dumbbell className="w-4 h-4 text-white/20 mx-auto mb-1" />
                  <div className="font-display text-base font-black text-white leading-tight">
                    {Object.keys(setsData).length}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-white/30">Series</span>
                </div>
                <div className="bg-[#1E1E1E] border border-[#2A2A2A]/40 rounded-2xl p-3 text-center">
                  <Trophy className="w-4 h-4 text-white/20 mx-auto mb-1" />
                  <div className="font-display text-sm font-black text-[#FFD700] leading-tight mt-0.5 truncate">
                    {workoutResult.weekly || 1} / 4
                  </div>
                  <span className="text-[9px] uppercase font-bold text-white/30">Semanal</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowComplete(false);
                  navigate("/mirutina");
                }}
                className="w-full h-13 gradient-gold text-black font-bold rounded-xl text-sm transition-all hover:brightness-110 active:scale-[0.98] shadow-lg shadow-[#FFD700]/5"
              >
                Guardar y Salir
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SetRow({
  setNumber,
  objective,
  isLogged,
  initialWeight,
  initialReps,
  onLog,
}: {
  setNumber: number;
  objective: string;
  isLogged: boolean;
  initialWeight?: number;
  initialReps?: number;
  onLog: (peso: number, reps: number) => void;
}) {
  const [peso, setPeso] = useState<number>(initialWeight || 0);
  const [reps, setReps] = useState<number>(initialReps || 0);

  // Sync inputs with updates if they change externally (like going to another exercise and back)
  useEffect(() => {
    if (initialWeight !== undefined) setPeso(initialWeight);
    if (initialReps !== undefined) setReps(initialReps);
  }, [initialWeight, initialReps]);

  const handleWeightChange = (val: number) => {
    if (isLogged) return;
    setPeso(Math.max(0, val));
  };

  const handleRepsChange = (val: number) => {
    if (isLogged) return;
    setReps(Math.max(0, val));
  };

  return (
    <div
      className={`grid grid-cols-12 items-center gap-1.5 p-2 rounded-xl transition-all ${
        isLogged
          ? "bg-green-500/5 border border-green-500/15"
          : "bg-[#1E1E1E] border border-[#2A2A2A]/60"
      }`}
    >
      {/* Set Number */}
      <span className="col-span-2 text-center text-xs font-bold text-white/50">
        {setNumber}
      </span>

      {/* Target display */}
      <span className="col-span-3 text-center text-[10px] font-semibold text-white/35 bg-[#171717] py-1.5 rounded-lg border border-[#252525]">
        {objective} reps
      </span>

      {/* Weight input with buttons */}
      <div className="col-span-3 flex items-center justify-center bg-[#0C0C0C] border border-[#2A2A2A] rounded-lg px-1.5 h-9">
        <input
          type="number"
          step="2.5"
          disabled={isLogged}
          value={peso || ""}
          onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className="w-full bg-transparent border-none text-center text-xs font-bold text-white focus:outline-none placeholder:text-white/10"
        />
        <span className="text-[9px] text-white/30 ml-0.5">kg</span>
      </div>

      {/* Reps input */}
      <div className="col-span-2 flex items-center justify-center bg-[#0C0C0C] border border-[#2A2A2A] rounded-lg px-1 h-9">
        <input
          type="number"
          disabled={isLogged}
          value={reps || ""}
          onChange={(e) => handleRepsChange(parseInt(e.target.value) || 0)}
          placeholder="0"
          className="w-full bg-transparent border-none text-center text-xs font-bold text-white focus:outline-none placeholder:text-white/10"
        />
      </div>

      {/* Log set checkbox trigger */}
      <div className="col-span-2 flex justify-end">
        <button
          type="button"
          disabled={isLogged || peso <= 0 || reps <= 0}
          onClick={() => onLog(peso, reps)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            isLogged
              ? "bg-green-500 text-white"
              : "bg-[#FFD700]/10 border border-[#FFD700]/25 text-[#FFD700] hover:bg-[#FFD700]/25 disabled:opacity-20"
          }`}
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
