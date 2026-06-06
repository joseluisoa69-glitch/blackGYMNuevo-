import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useStore } from "@/store/useStore";
import {
  Search,
  X,
  Dumbbell,
  Clock,
  ChevronRight,
  Info,
  Scan,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const muscleGroups = [
  { id: "pecho", name: "Pecho", x: 50, y: 22, r: 35 },
  { id: "hombros", name: "Hombros", x: 28, y: 18, r: 18 },
  { id: "hombros-r", name: "Hombros", x: 72, y: 18, r: 18 },
  { id: "biceps", name: "Biceps", x: 22, y: 32, r: 16 },
  { id: "biceps-r", name: "Biceps", x: 78, y: 32, r: 16 },
  { id: "abs", name: "Abdominales", x: 50, y: 38, r: 28 },
  { id: "oblicuos", name: "Oblicuos", x: 38, y: 38, r: 14 },
  { id: "oblicuos-r", name: "Oblicuos", x: 62, y: 38, r: 14 },
  { id: "cuadriceps", name: "Cuadriceps", x: 38, y: 60, r: 22 },
  { id: "cuadriceps-r", name: "Cuadriceps", x: 62, y: 60, r: 22 },
  { id: "pantorrilla", name: "Pantorrilla", x: 38, y: 82, r: 16 },
  { id: "pantorrilla-r", name: "Pantorrilla", x: 62, y: 82, r: 16 },
  { id: "trapecio", name: "Trapecio", x: 50, y: 12, r: 20 },
  { id: "antebrazo", name: "Antebrazo", x: 15, y: 42, r: 14 },
  { id: "antebrazo-r", name: "Antebrazo", x: 85, y: 42, r: 14 },
];

const muscleGroupsBack = [
  { id: "espalda", name: "Dorsales", x: 50, y: 25, r: 40 },
  { id: "trapecio-p", name: "Trapecio", x: 50, y: 12, r: 25 },
  { id: "hombros-p", name: "Hombros Post.", x: 28, y: 18, r: 18 },
  { id: "hombros-pr", name: "Hombros Post.", x: 72, y: 18, r: 18 },
  { id: "triceps", name: "Triceps", x: 22, y: 32, r: 16 },
  { id: "triceps-r", name: "Triceps", x: 78, y: 32, r: 16 },
  { id: "lumbar", name: "Lumbar", x: 50, y: 40, r: 22 },
  { id: "gluteos", name: "Gluteos", x: 50, y: 50, r: 28 },
  { id: "femoral", name: "Femoral", x: 38, y: 62, r: 20 },
  { id: "femoral-r", name: "Femoral", x: 62, y: 62, r: 20 },
  { id: "pantorrilla-p", name: "Pantorrilla", x: 38, y: 82, r: 16 },
  { id: "pantorrilla-pr", name: "Pantorrilla", x: 62, y: 82, r: 16 },
];

const equipmentFilters = [
  "Destacado", "Barra", "Mancuernas", "Peso Corporal", "Maquina",
  "Cables", "Kettlebell", "Banda", "TRX",
];

export default function Explorar() {
  const { muscleView, setMuscleView, selectedMuscle, setSelectedMuscle } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const { data: exercises } = trpc.exerciseLibrary.list.useQuery(
    {
      grupoMuscular: selectedMuscle || undefined,
      search: searchQuery || undefined,
    },
    { enabled: !!selectedMuscle || !!searchQuery }
  );

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq]
    );
  };

  const filteredExercises = exercises?.filter((ex) => {
    if (selectedEquipment.length === 0) return true;
    return selectedEquipment.some(
      (eq) => ex.equipo?.toLowerCase() === eq.toLowerCase()
    );
  });

  const currentMuscles = muscleView === "front" ? muscleGroups : muscleGroupsBack;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Mapa Muscular</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#141414] rounded-xl p-1 border border-[#2A2A2A]">
            <button
              onClick={() => setMuscleView("front")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                muscleView === "front"
                  ? "bg-[#FFD700]/10 text-[#FFD700]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Frontal
            </button>
            <button
              onClick={() => setMuscleView("back")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                muscleView === "back"
                  ? "bg-[#FFD700]/10 text-[#FFD700]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Trasera
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar ejercicio..."
          className="w-full h-12 pl-12 pr-4 bg-[#141414] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none transition-colors"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Body Map */}
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-[400px]">
            <motion.img
              key={muscleView}
              src={muscleView === "front" ? "/assets/body-front.jpg" : "/assets/body-back.jpg"}
              alt="Body map"
              className="w-full h-auto rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Interactive Muscle Zones */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {currentMuscles.map((muscle) => (
                <circle
                  key={muscle.id}
                  cx={`${muscle.x}%`}
                  cy={`${muscle.y}%`}
                  r={`${muscle.r / 5}%`}
                  fill={
                    selectedMuscle === muscle.name
                      ? "rgba(255,215,0,0.35)"
                      : hoveredMuscle === muscle.name
                      ? "rgba(255,215,0,0.15)"
                      : "transparent"
                  }
                  stroke={
                    selectedMuscle === muscle.name || hoveredMuscle === muscle.name
                      ? "#FFD700"
                      : "transparent"
                  }
                  strokeWidth={selectedMuscle === muscle.name ? 0.5 : 0.3}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredMuscle(muscle.name)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() =>
                    setSelectedMuscle(
                      selectedMuscle === muscle.name ? null : muscle.name
                    )
                  }
                  style={
                    selectedMuscle === muscle.name
                      ? { filter: "drop-shadow(0 0 6px rgba(255,215,0,0.5))", animation: "muscle-pulse 1.5s infinite" }
                      : {}
                  }
                />
              ))}
            </svg>
            {/* Muscle Label Tooltip */}
            {hoveredMuscle && !selectedMuscle && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#141414] border border-[#FFD700]/30 px-3 py-1.5 rounded-lg shadow-xl pointer-events-none z-10">
                <span className="text-xs font-medium text-[#FFD700]">{hoveredMuscle}</span>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Panel */}
        <div className="lg:w-[380px] flex-shrink-0">
          <AnimatePresence mode="wait">
            {selectedMuscle || searchQuery ? (
              <motion.div
                key="exercises"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden"
              >
                {/* Panel Header */}
                <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedMuscle
                        ? `Ejercicios para ${selectedMuscle}`
                        : "Resultados"}
                    </h3>
                    <p className="text-xs text-white/40">
                      {filteredExercises?.length || 0} ejercicios
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMuscle(null);
                      setSearchQuery("");
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1E1E1E] text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Equipment Filters */}
                <div className="p-3 border-b border-[#2A2A2A]">
                  <div className="flex flex-wrap gap-1.5">
                    {equipmentFilters.map((eq) => (
                      <button
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedEquipment.includes(eq)
                            ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20"
                            : "bg-[#1E1E1E] text-white/50 border border-transparent hover:text-white/70"
                        }`}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exercise List */}
                <div className="max-h-[500px] overflow-y-auto divide-y divide-[#2A2A2A]">
                  {filteredExercises?.map((exercise: any) => (
                    <button
                      key={exercise.id}
                      onClick={() => setSelectedExercise(exercise)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-all group"
                    >
                      <div className="w-12 h-12 bg-[#1E1E1E] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="w-5 h-5 text-[#FFD700]/50 group-hover:text-[#FFD700] transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {exercise.nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-white/30 bg-[#1E1E1E] px-1.5 py-0.5 rounded">
                            {exercise.equipo}
                          </span>
                          <span className="text-xs text-white/30">
                            {exercise.dificultad}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-[#FFD700] transition-colors flex-shrink-0" />
                    </button>
                  ))}
                  {(!filteredExercises || filteredExercises.length === 0) && (
                    <div className="p-8 text-center">
                      <Dumbbell className="w-8 h-8 text-white/10 mx-auto mb-2" />
                      <p className="text-sm text-white/30">No hay ejercicios</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-8 text-center"
              >
                <Scan className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">
                  Selecciona un musculo en el mapa o busca un ejercicio
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedExercise.nombre}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded-full">
                        {selectedExercise.grupoMuscular}
                      </span>
                      <span className="text-xs bg-[#1E1E1E] text-white/50 px-2 py-1 rounded-full">
                        {selectedExercise.equipo}
                      </span>
                      <span className="text-xs bg-[#1E1E1E] text-white/50 px-2 py-1 rounded-full">
                        {selectedExercise.dificultad}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1E1E1E] text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedExercise.descripcion && (
                  <p className="text-sm text-white/60 mb-4">
                    {selectedExercise.descripcion}
                  </p>
                )}

                {selectedExercise.instrucciones && (
                  <div className="bg-[#1E1E1E] rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-[#FFD700]" />
                      <span className="text-sm font-medium text-white">Instrucciones</span>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {selectedExercise.instrucciones}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-white/40">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>3-4 series</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4" />
                    <span>8-12 reps</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedExercise(null)}
                  className="w-full mt-6 h-12 gradient-gold text-black font-bold rounded-xl hover:brightness-110 transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
