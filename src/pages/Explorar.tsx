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

// Zonas musculares con paths SVG más precisos (en lugar de círculos)
const muscleZones = [
  // Cabeza y cuello
  { id: "trapecio", name: "Trapecio", path: "M45,8 L55,8 L58,15 L42,15 Z", x: 50, y: 12, r: 12 },
  
  // Hombros (más arriba y a los lados)
  { id: "hombros", name: "Hombros", path: "M20,15 L32,15 L30,22 L22,22 Z", x: 26, y: 18, r: 14 },
  { id: "hombros-r", name: "Hombros", path: "M68,15 L80,15 L78,22 L70,22 Z", x: 74, y: 18, r: 14 },
  
  // Pecho (más pequeño, solo centro superior)
  { id: "pecho", name: "Pecho", path: "M38,20 L62,20 L60,30 L40,30 Z", x: 50, y: 25, r: 18 },
  
  // Biceps (más abajo de hombros)
  { id: "biceps", name: "Biceps", path: "M15,28 L25,28 L24,36 L16,36 Z", x: 20, y: 32, r: 12 },
  { id: "biceps-r", name: "Biceps", path: "M75,28 L85,28 L84,36 L76,36 Z", x: 80, y: 32, r: 12 },
  
  // Antebrazos
  { id: "antebrazo", name: "Antebrazo", path: "M12,38 L22,38 L20,46 L14,46 Z", x: 17, y: 42, r: 10 },
  { id: "antebrazo-r", name: "Antebrazo", path: "M78,38 L88,38 L86,46 L80,46 Z", x: 83, y: 42, r: 10 },
  
  // Abdominales (centro)
  { id: "abs", name: "Abdominales", path: "M42,32 L58,32 L56,45 L44,45 Z", x: 50, y: 38, r: 15 },
  
  // Oblicuos (a los lados del abdomen)
  { id: "oblicuos", name: "Oblicuos", path: "M35,35 L42,35 L40,42 L37,42 Z", x: 38, y: 38, r: 8 },
  { id: "oblicuos-r", name: "Oblicuos", path: "M58,35 L65,35 L63,42 L60,42 Z", x: 62, y: 38, r: 8 },
  
  // Cuadriceps (muslos frontales)
  { id: "cuadriceps", name: "Cuadriceps", path: "M35,50 L45,50 L43,68 L37,68 Z", x: 40, y: 60, r: 14 },
  { id: "cuadriceps-r", name: "Cuadriceps", path: "M55,50 L65,50 L63,68 L57,68 Z", x: 60, y: 60, r: 14 },
  
  // Pantorrillas
  { id: "pantorrilla", name: "Pantorrilla", path: "M35,72 L42,72 L40,88 L37,88 Z", x: 38, y: 82, r: 10 },
  { id: "pantorrilla-r", name: "Pantorrilla", path: "M58,72 L65,72 L63,88 L60,88 Z", x: 62, y: 82, r: 10 },
];

const muscleZonesBack = [
  // Trapecio posterior
  { id: "trapecio-p", name: "Trapecio", path: "M40,8 L60,8 L62,18 L38,18 Z", x: 50, y: 12, r: 14 },
  
  // Hombros posteriores
  { id: "hombros-p", name: "Hombros Post.", path: "M22,15 L32,15 L30,22 L24,22 Z", x: 27, y: 18, r: 12 },
  { id: "hombros-pr", name: "Hombros Post.", path: "M68,15 L78,15 L76,22 L70,22 Z", x: 73, y: 18, r: 12 },
  
  // Dorsales (espalda)
  { id: "espalda", name: "Dorsales", path: "M35,20 L65,20 L62,38 L38,38 Z", x: 50, y: 28, r: 20 },
  
  // Triceps
  { id: "triceps", name: "Triceps", path: "M15,28 L25,28 L24,36 L16,36 Z", x: 20, y: 32, r: 10 },
  { id: "triceps-r", name: "Triceps", path: "M75,28 L85,28 L84,36 L76,36 Z", x: 80, y: 32, r: 10 },
  
  // Lumbar
  { id: "lumbar", name: "Lumbar", path: "M42,38 L58,38 L56,48 L44,48 Z", x: 50, y: 42, r: 12 },
  
  // Gluteos
  { id: "gluteos", name: "Gluteos", path: "M38,48 L62,48 L60,58 L40,58 Z", x: 50, y: 52, r: 14 },
  
  // Femoral (muslos posteriores)
  { id: "femoral", name: "Femoral", path: "M35,58 L45,58 L43,72 L37,72 Z", x: 40, y: 65, r: 12 },
  { id: "femoral-r", name: "Femoral", path: "M55,58 L65,58 L63,72 L57,72 Z", x: 60, y: 65, r: 12 },
  
  // Pantorrillas posteriores
  { id: "pantorrilla-p", name: "Pantorrilla", path: "M35,74 L42,74 L40,88 L37,88 Z", x: 38, y: 82, r: 10 },
  { id: "pantorrilla-pr", name: "Pantorrilla", path: "M58,74 L65,74 L63,88 L60,88 Z", x: 62, y: 82, r: 10 },
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

  const currentMuscles = muscleView === "front" ? muscleZones : muscleZonesBack;

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
            {/* Interactive Muscle Zones - Usando paths más precisos */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {currentMuscles.map((muscle) => (
                <g key={muscle.id}>
                  {/* Path invisible para detección de clic más precisa */}
                  <path
                    d={muscle.path}
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
                  {/* Círculo pequeño visible solo en hover para guía */}
                  <circle
                    cx={`${muscle.x}%`}
                    cy={`${muscle.y}%`}
                    r="1.5"
                    fill={hoveredMuscle === muscle.name ? "#FFD700" : "transparent"}
                    className="pointer-events-none transition-all duration-200"
                  />
                </g>
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
