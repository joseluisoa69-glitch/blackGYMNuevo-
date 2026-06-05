import { useState } from "react";
import { trpc } from "@/providers/trpc";
import {
  TrendingUp,
  Calendar,
  Dumbbell,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Weight,
  Ruler,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Progreso() {
  const [activeTab, setActiveTab] = useState<"historial" | "medidas" | "graficas">("historial");
  const [showAddMeasure, setShowAddMeasure] = useState(false);
  const [measureForm, setMeasureForm] = useState({
    peso: "",
    grasaCorporal: "",
    pecho: "",
    cintura: "",
    cadera: "",
    biceps: "",
    muslo: "",
  });
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null);

  const { data: history } = trpc.workout.historyWithSets.useQuery();
  const { data: progress } = trpc.progress.get.useQuery();
  const addProgress = trpc.progress.add.useMutation({
    onSuccess: () => {
      setShowAddMeasure(false);
      setMeasureForm({ peso: "", grasaCorporal: "", pecho: "", cintura: "", cadera: "", biceps: "", muslo: "" });
    },
  });

  const weightData = progress
    ?.filter((p) => p.peso)
    .map((p) => ({
      fecha: new Date(p.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      peso: p.peso,
    }))
    .reverse() || [];

  const weeklyVolume = history
    ?.filter((w) => w.completado)
    .slice(0, 12)
    .map((w) => ({
      fecha: new Date(w.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      volumen: w.volumenTotal || 0,
    }))
    .reverse() || [];

  const handleAddMeasure = () => {
    addProgress.mutate({
      peso: measureForm.peso ? parseFloat(measureForm.peso) : undefined,
      grasaCorporal: measureForm.grasaCorporal ? parseFloat(measureForm.grasaCorporal) : undefined,
      pecho: measureForm.pecho ? parseFloat(measureForm.pecho) : undefined,
      cintura: measureForm.cintura ? parseFloat(measureForm.cintura) : undefined,
      cadera: measureForm.cadera ? parseFloat(measureForm.cadera) : undefined,
      biceps: measureForm.biceps ? parseFloat(measureForm.biceps) : undefined,
      muslo: measureForm.muslo ? parseFloat(measureForm.muslo) : undefined,
    });
  };

  const tabs = [
    { id: "historial" as const, label: "Historial", icon: Calendar },
    { id: "medidas" as const, label: "Medidas", icon: Ruler },
    { id: "graficas" as const, label: "Graficas", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#FFD700]" />
          Progreso
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#141414] rounded-xl p-1 border border-[#2A2A2A]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#FFD700]/10 text-[#FFD700]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Historial Tab */}
      {activeTab === "historial" && (
        <div className="space-y-2">
          {history && history.length > 0 ? (
            history.map((workout: any) => (
              <div
                key={workout.id}
                className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFD700]/10 rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{workout.diaNombre || "Entrenamiento"}</p>
                      <p className="text-xs text-white/40">
                        {new Date(workout.fecha).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {workout.duracionMinutos && (
                      <span className="flex items-center gap-1 text-xs text-white/40">
                        <Clock className="w-3 h-3" />
                        {workout.duracionMinutos}m
                      </span>
                    )}
                    {workout.completado ? (
                      <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Completado</span>
                    ) : (
                      <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full">En progreso</span>
                    )}
                    {expandedWorkout === workout.id ? (
                      <ChevronUp className="w-4 h-4 text-white/30" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/30" />
                    )}
                  </div>
                </button>
                {expandedWorkout === workout.id && workout.sets && (
                  <div className="px-4 pb-4 border-t border-[#2A2A2A]">
                    <div className="mt-3 space-y-1">
                      {workout.sets.map((set: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1 text-sm">
                          <span className="text-white/50">{set.exerciseName}</span>
                          <span className="text-[#FFD700]">{set.pesoKg}kg x {set.reps}</span>
                        </div>
                      ))}
                    </div>
                    {workout.volumenTotal > 0 && (
                      <p className="text-xs text-white/30 mt-2">Volumen total: {workout.volumenTotal}kg</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-[#141414] border border-[#2A2A2A] rounded-xl">
              <Calendar className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Sin entrenamientos registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Medidas Tab */}
      {activeTab === "medidas" && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddMeasure(!showAddMeasure)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl text-[#FFD700] font-medium hover:bg-[#FFD700]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Registrar Medidas
          </button>

          {showAddMeasure && (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "peso", label: "Peso (kg)" },
                  { key: "grasaCorporal", label: "Grasa %" },
                  { key: "pecho", label: "Pecho (cm)" },
                  { key: "cintura", label: "Cintura (cm)" },
                  { key: "cadera", label: "Cadera (cm)" },
                  { key: "biceps", label: "Biceps (cm)" },
                  { key: "muslo", label: "Muslo (cm)" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-white/50 mb-1 block">{field.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={(measureForm as any)[field.key]}
                      onChange={(e) => setMeasureForm({ ...measureForm, [field.key]: e.target.value })}
                      className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg text-white text-sm focus:border-[#FFD700] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddMeasure}
                disabled={addProgress.isPending}
                className="w-full h-11 gradient-gold text-black font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                {addProgress.isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          )}

          {/* Progress Table */}
          {progress && progress.length > 0 ? (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left p-3 text-white/50 font-medium">Fecha</th>
                    <th className="text-left p-3 text-white/50 font-medium">Peso</th>
                    <th className="text-left p-3 text-white/50 font-medium">Grasa%</th>
                    <th className="text-left p-3 text-white/50 font-medium">Cintura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {progress.slice(0, 10).map((p: any) => (
                    <tr key={p.id} className="hover:bg-white/5">
                      <td className="p-3 text-white/70">{new Date(p.fecha).toLocaleDateString("es-ES")}</td>
                      <td className="p-3 text-[#FFD700]">{p.peso || "-"}</td>
                      <td className="p-3 text-white/50">{p.grasaCorporal || "-"}</td>
                      <td className="p-3 text-white/50">{p.cintura || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#141414] border border-[#2A2A2A] rounded-xl">
              <Weight className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Sin mediciones registradas</p>
            </div>
          )}
        </div>
      )}

      {/* Graficas Tab */}
      {activeTab === "graficas" && (
        <div className="space-y-6">
          {/* Weight Chart */}
          {weightData.length > 1 && (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Peso (kg)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="fecha" stroke="#555" fontSize={12} />
                  <YAxis stroke="#555" fontSize={12} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: "12px" }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#FFD700" }}
                  />
                  <Area type="monotone" dataKey="peso" stroke="#FFD700" fill="url(#weightGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Volume Chart */}
          {weeklyVolume.length > 0 && (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Volumen por Entrenamiento</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="fecha" stroke="#555" fontSize={12} />
                  <YAxis stroke="#555" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: "12px" }}
                    labelStyle={{ color: "#fff" }}
                    itemStyle={{ color: "#FFD700" }}
                  />
                  <Bar dataKey="volumen" fill="#FFD700" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {weightData.length <= 1 && weeklyVolume.length === 0 && (
            <div className="text-center py-12 bg-[#141414] border border-[#2A2A2A] rounded-xl">
              <TrendingUp className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Registra mas entrenamientos para ver graficas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
