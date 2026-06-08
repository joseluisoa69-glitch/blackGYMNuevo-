import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Dumbbell,
  Heart,
  Calendar,
  Goal,
  Activity,
  Flame,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OBJETIVOS = [
  { id: "perder_peso", label: "Perder Peso", icon: "🔥" },
  { id: "ganar_musculo", label: "Ganar Músculo", icon: "💪" },
  { id: "mantener", label: "Mantener", icon: "⚖️" },
  { id: "fuerza", label: "Fuerza", icon: "🏋️" },
  { id: "resistencia", label: "Resistencia", icon: "🏃" },
] as const;

const TIPOS_CUERPO = [
  { id: "ectomorfo", label: "Ectomorfo", desc: "Delgado, metabolismo rápido" },
  { id: "mesomorfo", label: "Mesomorfo", desc: "Atlético, gana músculo fácil" },
  { id: "endomorfo", label: "Endomorfo", desc: "Robusto, tiende a acumular grasa" },
] as const;

const TRABAJOS = [
  { id: "sedentario", label: "Sedentario", desc: "Oficina, poco movimiento" },
  { id: "mixto", label: "Mixto", desc: "Caminar moderado, de pie" },
  { id: "fisico", label: "Físico", desc: "Construcción, carga activa" },
] as const;

const COMIDAS = [
  { id: "1-2", label: "1 a 2 comidas" },
  { id: "3", label: "3 comidas" },
  { id: "4-5", label: "4 a 5 comidas" },
  { id: "6+", label: "6 o más comidas" },
] as const;

const EXPERIENCIAS = [
  { id: "nunca", label: "Nunca" },
  { id: "<1 ano", label: "< 1 año" },
  { id: "1-3 anos", label: "1 a 3 años" },
  { id: ">3 anos", label: "Más de 3 años" },
] as const;

const EQUIPOS = [
  { id: "gym_completo", label: "Gym Completo", desc: "Acceso a poleas, barra, máquinas" },
  { id: "mancuernas_casa", label: "Mancuernas en Casa", desc: "Solo peso libre básico" },
  { id: "bandas", label: "Bandas de Resistencia", desc: "Entrenamiento elástico" },
  { id: "calistenia", label: "Calistenia", desc: "Solo peso corporal" },
] as const;

const MUSCULOS_LIST = [
  "Pecho",
  "Espalda",
  "Brazos",
  "Piernas",
  "Hombros",
  "Abs",
  "Glúteos",
];

const SPLITS: Record<number, string> = {
  1: "1: Full Body (Cuerpo Completo)",
  2: "2: Upper / Lower (Superior/Inferior)",
  3: "3: PPL (Push, Pull, Legs)",
  4: "4: Torso/Pierna Frecuencia 2",
  5: "5: Bro Split (Grupo por Día)",
  6: "6: Arnold Split o Frecuencia 2 Alta",
};

export default function Rutina() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    // Sección 1: Perfil Corporal
    name: "",
    edad: 25,
    pesoKg: 70,
    alturaCm: 170,
    genero: "masculino" as "masculino" | "femenino",
    porcentajeGrasa: null as number | null,
    tipoCuerpo: "mesomorfo" as "ectomorfo" | "mesomorfo" | "endomorfo",

    // Sección 2: Estilo de Vida
    trabajo: "sedentario" as "sedentario" | "fisico" | "mixto",
    horasSueno: 8,
    nivelEstres: 5,
    comidasPorDia: "3" as "1-2" | "3" | "4-5" | "6+",
    gramosProteinaDiaria: null as number | null,
    preferenciaProteina: "" as string,
    intolerancias: "",
    alimentosNoGustan: "",

    // Sección 3: Historial y Estado
    experienciaPrevia: "1-3 anos" as "nunca" | "<1 ano" | "1-3 anos" | ">3 anos",
    diasActuales: 3,
    cirugiasPrevias: "",
    enfermedadesCronicas: "",
    medicamentos: "",
    doloresPersistentes: "",
    lesiones: "",

    // Sección 4: Metas y Preferencias
    objetivoPrincipal: "ganar_musculo" as "perder_peso" | "ganar_musculo" | "mantener" | "fuerza" | "resistencia",
    metaEspecifica: "",
    tiempoMeta: 12, // semanas
    accesoGym: "gym_completo" as "gym_completo" | "mancuernas_casa" | "bandas" | "calistenia",

    // Sección 5: Preferencias Musculares
    musculosPrioridad: [] as string[],
    ejerciciosFavoritos: "",
    ejerciciosOdiados: "",

    // Sección 6: Entrenamiento
    diasPorSemana: 3,
    tiempoSesion: 60,
    notasAdicionales: "",
  });

  const generateRoutineMutation = trpc.ai.generateRoutine.useMutation({
    onSuccess: () => {
      navigate("/mirutina");
    },
    onError: (error) => {
      setErrorMsg(error.message || "Error al generar la rutina por IA. Inténtalo de nuevo.");
      setCurrentStep(5); // Go back to final step to retry
    },
  });

  const nextStep = () => {
    // Validate current step
    if (currentStep === 0) {
      if (!formData.name.trim()) {
        setErrorMsg("Por favor, ingresa tu nombre.");
        return;
      }
      if (formData.edad <= 0 || formData.pesoKg <= 0 || formData.alturaCm <= 0) {
        setErrorMsg("Por favor, ingresa valores válidos para edad, peso y altura.");
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.metaEspecifica.trim()) {
        setErrorMsg("Por favor, detalla tu meta específica.");
        return;
      }
    }
    setErrorMsg(null);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleMusculoToggle = (musculo: string) => {
    setFormData((prev) => {
      const exist = prev.musculosPrioridad.includes(musculo);
      if (exist) {
        return {
          ...prev,
          musculosPrioridad: prev.musculosPrioridad.filter((m) => m !== musculo),
        };
      } else {
        return {
          ...prev,
          musculosPrioridad: [...prev.musculosPrioridad, musculo],
        };
      }
    });
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    generateRoutineMutation.mutate(formData);
  };

  const stepsHeaders = [
    { title: "Perfil Corporal", subtitle: "Datos corporales básicos", icon: UserIcon },
    { title: "Estilo de Vida", subtitle: "Sueño, estrés y nutrición", icon: Activity },
    { title: "Historial Físico", subtitle: "Lesiones y experiencia", icon: Heart },
    { title: "Metas y Equipos", subtitle: "Objetivo y acceso", icon: Goal },
    { title: "Músculos y Ejercicios", subtitle: "Preferencias directas", icon: Dumbbell },
    { title: "Planificación", subtitle: "Distribución del entrenamiento", icon: Calendar },
  ];

  const StepIcon = stepsHeaders[currentStep].icon;

  if (generateRoutineMutation.isPending) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 360, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 gradient-gold rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,215,0,0.2)]"
        >
          <Sparkles className="w-10 h-10 text-black animate-pulse" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Construyendo tu plan maestro AI...</h2>
        <p className="text-white/60 text-sm max-w-md">
          Nuestro Entrenador Virtual está analizando tu masa corporal, tus limitaciones físicas y tu nivel de estrés para estructurar el split óptimo de entrenamiento. Esto tardará unos segundos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FFD700]" />
            Generador de Rutinas AI
          </h1>
          <p className="text-white/50 text-sm mt-1">Configura detalladamente tu perfil para DeepSeek AI</p>
        </div>
        <div className="text-sm font-semibold bg-[#141414] border border-[#2A2A2A] text-white/60 px-3 py-1.5 rounded-xl">
          Paso {currentStep + 1} de 6
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden flex gap-1">
        {stepsHeaders.map((_, idx) => (
          <div
            key={idx}
            className={`h-full flex-1 transition-all duration-300 rounded-full ${
              idx <= currentStep ? "bg-[#FFD700]" : "bg-[#2A2A2A]"
            }`}
          />
        ))}
      </div>

      {/* Main Form Container */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        {/* Step Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#2A2A2A] mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 flex items-center justify-center border border-[#FFD700]/20">
            <StepIcon className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{stepsHeaders[currentStep].title}</h2>
            <p className="text-xs text-white/50">{stepsHeaders[currentStep].subtitle}</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-2xl flex items-start gap-3 mb-6 animate-pulse">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Form Sections */}
        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* SECTION 1: Perfil Corporal */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Nombre</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tu nombre completo"
                        className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Edad</label>
                      <input
                        type="number"
                        value={formData.edad || ""}
                        onChange={(e) => setFormData({ ...formData, edad: parseInt(e.target.value) || 0 })}
                        placeholder="Años"
                        className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Peso (kg)</label>
                      <input
                        type="number"
                        value={formData.pesoKg || ""}
                        onChange={(e) => setFormData({ ...formData, pesoKg: parseFloat(e.target.value) || 0 })}
                        placeholder="Ej. 72.5"
                        className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Altura (cm)</label>
                      <input
                        type="number"
                        value={formData.alturaCm || ""}
                        onChange={(e) => setFormData({ ...formData, alturaCm: parseInt(e.target.value) || 0 })}
                        placeholder="Ej. 175"
                        className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Género</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["masculino", "femenino"] as const).map((gen) => (
                        <button
                          key={gen}
                          type="button"
                          onClick={() => setFormData({ ...formData, genero: gen })}
                          className={`h-12 rounded-xl font-bold text-sm border capitalize transition-all ${
                            formData.genero === gen
                              ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                              : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                          }`}
                        >
                          {gen}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">
                        % Grasa Corporal <span className="text-white/30 text-[10px]">(Opcional)</span>
                      </label>
                      <input
                        type="number"
                        value={formData.porcentajeGrasa || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            porcentajeGrasa: parseFloat(e.target.value) || null,
                          })
                        }
                        placeholder="Ej. 15"
                        className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Tipo de Cuerpo</label>
                      <div className="grid grid-cols-3 gap-2">
                        {TIPOS_CUERPO.map((body) => (
                          <button
                            key={body.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, tipoCuerpo: body.id })}
                            className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                              formData.tipoCuerpo === body.id
                                ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                                : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                            }`}
                            title={body.desc}
                          >
                            {body.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: Estilo de Vida */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-3 block font-semibold">Nivel de Actividad Laboral</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {TRABAJOS.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, trabajo: job.id })}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            formData.trabajo === job.id
                              ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                              : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                          }`}
                        >
                          <div className="text-sm font-bold block">{job.label}</div>
                          <span className="text-[10px] text-white/40 block mt-1 leading-normal">{job.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider mb-3 font-semibold">
                        <span>Horas de Sueño</span>
                        <span className="text-[#FFD700]">{formData.horasSueno} hrs</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={formData.horasSueno}
                        onChange={(e) => setFormData({ ...formData, horasSueno: parseInt(e.target.value) })}
                        className="w-full accent-[#FFD700]"
                      />
                      <div className="flex justify-between text-[10px] text-white/30 mt-1">
                        <span>1 hr</span>
                        <span>6 hrs (límite)</span>
                        <span>12 hrs</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider mb-3 font-semibold">
                        <span>Nivel de Estrés Diario</span>
                        <span className="text-[#FFD700]">{formData.nivelEstres}/10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={formData.nivelEstres}
                        onChange={(e) => setFormData({ ...formData, nivelEstres: parseInt(e.target.value) })}
                        className="w-full accent-[#FFD700]"
                      />
                      <div className="flex justify-between text-[10px] text-white/30 mt-1">
                        <span>Bajo (1)</span>
                        <span>Medio (5)</span>
                        <span>Alto (10)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Comidas al Día</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {COMIDAS.map((com) => (
                          <button
                            key={com.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, comidasPorDia: com.id })}
                            className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                              formData.comidasPorDia === com.id
                                ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                                : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                            }`}
                          >
                            {com.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">
                        Proteína Diaria estimada (g) <span className="text-white/30 text-[10px]">(Opcional)</span>
                      </label>
                      <input
                        type="number"
                        value={formData.gramosProteinaDiaria || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gramosProteinaDiaria: parseInt(e.target.value) || null,
                          })
                        }
                        placeholder="Ej. 130"
                        className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Preferencia de proteína</label>
                      <input
                        type="text"
                        value={formData.preferenciaProteina}
                        onChange={(e) => setFormData({ ...formData, preferenciaProteina: e.target.value })}
                        placeholder="Ej. carne roja, pollo, pescados, vegana, vegetal"
                        className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Intolerancias o alergias</label>
                        <textarea
                          value={formData.intolerancias}
                          onChange={(e) => setFormData({ ...formData, intolerancias: e.target.value })}
                          placeholder="Ej. lactosa, gluten, frutos secos"
                          rows={2}
                          className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Alimentos que NO te gustan</label>
                        <textarea
                          value={formData.alimentosNoGustan}
                          onChange={(e) => setFormData({ ...formData, alimentosNoGustan: e.target.value })}
                          placeholder="Ej. brócoli, sardinas, aguacate"
                          rows={2}
                          className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: Historial y Estado */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Experiencia previa</label>
                      <div className="grid grid-cols-2 gap-2">
                        {EXPERIENCIAS.map((exp) => (
                          <button
                            key={exp.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, experienciaPrevia: exp.id })}
                            className={`h-11 rounded-xl text-xs font-bold border transition-all ${
                              formData.experienciaPrevia === exp.id
                                ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                                : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                            }`}
                          >
                            {exp.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider mb-2 font-semibold">
                        <span>Frecuencia Actual (Días)</span>
                        <span className="text-[#FFD700]">{formData.diasActuales} / 7</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={7}
                        value={formData.diasActuales}
                        onChange={(e) => setFormData({ ...formData, diasActuales: parseInt(e.target.value) })}
                        className="w-full accent-[#FFD700] mt-3"
                      />
                      <div className="flex justify-between text-[10px] text-white/30 mt-1">
                        <span>0 días</span>
                        <span>3-4 días</span>
                        <span>7 días</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block font-semibold">Lesiones o Dolores Limitantes</label>
                      <textarea
                        value={formData.lesiones}
                        onChange={(e) => setFormData({ ...formData, lesiones: e.target.value })}
                        placeholder="Dolor de rodilla, lumbar, etc."
                        rows={2}
                        className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block font-semibold">Dolores Persistentes</label>
                      <textarea
                        value={formData.doloresPersistentes}
                        onChange={(e) => setFormData({ ...formData, doloresPersistentes: e.target.value })}
                        placeholder="Hombro al empujar, etc."
                        rows={2}
                        className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block font-semibold">Cirugías previas</label>
                      <textarea
                        value={formData.cirugiasPrevias}
                        onChange={(e) => setFormData({ ...formData, cirugiasPrevias: e.target.value })}
                        placeholder="Hernias, suturas..."
                        rows={2}
                        className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block font-semibold">Enfermedades crónicas</label>
                      <textarea
                        value={formData.enfermedadesCronicas}
                        onChange={(e) => setFormData({ ...formData, enfermedadesCronicas: e.target.value })}
                        placeholder="Hipertensión, asma..."
                        rows={2}
                        className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-1 block font-semibold">Medicamentos tomados</label>
                      <textarea
                        value={formData.medicamentos}
                        onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                        placeholder="Insulina, analgésicos..."
                        rows={2}
                        className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: Metas y Preferencias */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-3 block font-semibold">Objetivo Principal</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {OBJETIVOS.map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, objetivoPrincipal: obj.id })}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            formData.objetivoPrincipal === obj.id
                              ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700] scale-[1.02]"
                              : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                          }`}
                        >
                          <div className="text-2xl mb-1">{obj.icon}</div>
                          <div className="text-xs font-bold leading-tight">{obj.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Meta Específica</label>
                    <textarea
                      value={formData.metaEspecifica}
                      onChange={(e) => setFormData({ ...formData, metaEspecifica: e.target.value })}
                      placeholder="Ej. Bajar a 12% grasa para mi boda en 3 meses, o aumentar fuerza en press de banca"
                      rows={2}
                      className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Equipamiento Disponible</label>
                      <div className="grid grid-cols-2 gap-2">
                        {EQUIPOS.map((eq) => (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, accesoGym: eq.id })}
                            className={`p-2 rounded-xl text-[10px] font-bold border transition-all text-center leading-tight ${
                              formData.accesoGym === eq.id
                                ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                                : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                            }`}
                            title={eq.desc}
                          >
                            {eq.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 5: Preferencias Musculares */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-3 block font-semibold">Músculos Prioridad</label>
                    <div className="flex flex-wrap gap-2">
                      {MUSCULOS_LIST.map((musc) => {
                        const isSelected = formData.musculosPrioridad.includes(musc);
                        return (
                          <button
                            key={musc}
                            type="button"
                            onClick={() => handleMusculoToggle(musc)}
                            className={`px-4 py-2.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "border-[#FFD700] bg-[#FFD700]/15 text-[#FFD700]"
                                : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                            }`}
                          >
                            <Flame className={`w-3.5 h-3.5 ${isSelected ? "text-[#FFD700] fill-[#FFD700]" : "text-white/20"}`} />
                            {musc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Ejercicios Favoritos</label>
                      <textarea
                        value={formData.ejerciciosFavoritos}
                        onChange={(e) => setFormData({ ...formData, ejerciciosFavoritos: e.target.value })}
                        placeholder="Ej. Press de Banca, Dominadas"
                        rows={3}
                        className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-sm animate-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Ejercicios Odiados / Evitar</label>
                      <textarea
                        value={formData.ejerciciosOdiados}
                        onChange={(e) => setFormData({ ...formData, ejerciciosOdiados: e.target.value })}
                        placeholder="Ej. Zancadas con barra libre, Burpees"
                        rows={3}
                        className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: Entrenamiento */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs text-white/50 uppercase tracking-wider mb-3 font-semibold">
                      <span>Días por Semana</span>
                      <span className="text-[#FFD700] font-bold">
                        {formData.diasPorSemana} días
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={formData.diasPorSemana}
                      onChange={(e) => setFormData({ ...formData, diasPorSemana: parseInt(e.target.value) })}
                      className="w-full accent-[#FFD700]"
                    />
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>1 día</span>
                      <span>3 días</span>
                      <span>6 días</span>
                    </div>
                    <div className="mt-3 p-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-center">
                      <span className="text-xs text-white/50 block">Split recomendado:</span>
                      <span className="text-sm text-[#FFD700] font-bold">{SPLITS[formData.diasPorSemana] || "Personalizado"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-3 block font-semibold">Tiempo por Sesión</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[30, 45, 60, 90].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, tiempoSesion: t })}
                          className={`h-12 rounded-xl text-xs font-bold border transition-all ${
                            formData.tiempoSesion === t
                              ? "border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]"
                              : "border-[#2A2A2A] bg-[#1E1E1E] text-white/40 hover:text-white"
                          }`}
                        >
                          {t} min
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block font-semibold">Notas o Solicitudes Adicionales</label>
                    <textarea
                      value={formData.notasAdicionales}
                      onChange={(e) => setFormData({ ...formData, notasAdicionales: e.target.value })}
                      placeholder="Ej. Prefiero no saltar, añadir cardio suave al final, más enfoque en glúteos, etc."
                      rows={2}
                      className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/20 focus:border-[#FFD700] focus:outline-none resize-none text-sm"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step Navigation Actions */}
        <div className="flex items-center justify-between border-t border-[#2A2A2A] pt-6 mt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="h-12 px-6 bg-[#1C1C1C] border border-[#2A2A2A] text-white/60 hover:text-white rounded-xl font-bold transition-all disabled:opacity-20 disabled:pointer-events-none flex items-center gap-2 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="h-12 px-6 bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/25 rounded-xl font-bold transition-all flex items-center gap-2 text-sm"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="h-12 px-6 gradient-gold text-black hover:brightness-110 rounded-xl font-bold transition-all flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              Generar Rutina con AI
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
