import { useState } from "react";
import {
  Calculator,
  Weight,
  Flame,
  Utensils,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function Calculadoras() {
  const [activeCalc, setActiveCalc] = useState<"1rm" | "tdee" | "macros">("1rm");

  // 1RM State
  const [rmPeso, setRmPeso] = useState("");
  const [rmReps, setRmReps] = useState("");
  const [rmResult, setRmResult] = useState<any>(null);

  // TDEE State
  const [tdeePeso, setTdeePeso] = useState("");
  const [tdeeAltura, setTdeeAltura] = useState("");
  const [tdeeEdad, setTdeeEdad] = useState("");
  const [tdeeGenero, setTdeeGenero] = useState<"masculino" | "femenino">("masculino");
  const [tdeeActividad, setTdeeActividad] = useState<"sedentario" | "ligero" | "moderado" | "intenso" | "muy_intenso">("moderado");
  const [tdeeResult, setTdeeResult] = useState<any>(null);

  // Macros State
  const [macrosTdee, setMacrosTdee] = useState("");
  const [macrosObjetivo, setMacrosObjetivo] = useState<"perder_peso" | "ganar_musculo" | "mantener">("mantener");
  const [macrosResult, setMacrosResult] = useState<any>(null);

  const handleCalc1RM = () => {
    const peso = parseFloat(rmPeso);
    const reps = parseInt(rmReps);
    if (peso > 0 && reps > 0) {
      const rm = peso * (1 + reps / 30);
      setRmResult({
        rm1: Math.round(rm),
        rm3: Math.round(rm * 0.93),
        rm5: Math.round(rm * 0.87),
        rm8: Math.round(rm * 0.80),
        rm10: Math.round(rm * 0.75),
        rm12: Math.round(rm * 0.70),
      });
    }
  };

  const handleCalcTDEE = () => {
    const peso = parseFloat(tdeePeso);
    const altura = parseFloat(tdeeAltura);
    const edad = parseInt(tdeeEdad);
    if (peso > 0 && altura > 0 && edad > 0) {
      let bmr: number;
      if (tdeeGenero === "masculino") {
        bmr = (10 * peso) + (6.25 * altura) - (5 * edad) + 5;
      } else {
        bmr = (10 * peso) + (6.25 * altura) - (5 * edad) - 161;
      }
      const mults: Record<string, number> = {
        sedentario: 1.2, ligero: 1.375, moderado: 1.55, intenso: 1.725, muy_intenso: 1.9,
      };
      const tdee = Math.round(bmr * (mults[tdeeActividad] || 1.55));
      setTdeeResult({
        bmr: Math.round(bmr),
        tdee,
        perderPeso: tdee - 500,
        ganarPeso: tdee + 500,
      });
    }
  };

  const handleCalcMacros = () => {
    const tdee = parseFloat(macrosTdee);
    if (tdee > 0) {
      let proteinas: number, grasas: number, carbs: number;
      if (macrosObjetivo === "perder_peso") {
        proteinas = Math.round(tdee * 0.40 / 4);
        grasas = Math.round(tdee * 0.30 / 9);
        carbs = Math.round(tdee * 0.30 / 4);
      } else if (macrosObjetivo === "ganar_musculo") {
        proteinas = Math.round(tdee * 0.30 / 4);
        grasas = Math.round(tdee * 0.25 / 9);
        carbs = Math.round(tdee * 0.45 / 4);
      } else {
        proteinas = Math.round(tdee * 0.30 / 4);
        grasas = Math.round(tdee * 0.30 / 9);
        carbs = Math.round(tdee * 0.40 / 4);
      }
      setMacrosResult({ proteinas, grasas, carbs });
    }
  };

  const calcTabs = [
    { id: "1rm" as const, label: "1RM", icon: Weight },
    { id: "tdee" as const, label: "TDEE", icon: Flame },
    { id: "macros" as const, label: "Macros", icon: Utensils },
  ];

  const macroColors = ["#FFD700", "#FF5722", "#2196F3"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-[#FFD700]" />
          Calculadoras
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#141414] rounded-xl p-1 border border-[#2A2A2A]">
        {calcTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCalc(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeCalc === tab.id
                ? "bg-[#FFD700]/10 text-[#FFD700]"
                : "text-white/50 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1RM Calculator */}
      {activeCalc === "1rm" && (
        <div className="space-y-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Calculadora 1RM</h3>
            <p className="text-sm text-white/40">Formula de Epley</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Peso levantado (kg)</label>
                <input
                  type="number"
                  value={rmPeso}
                  onChange={(e) => setRmPeso(e.target.value)}
                  placeholder="100"
                  className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Repeticiones</label>
                <input
                  type="number"
                  value={rmReps}
                  onChange={(e) => setRmReps(e.target.value)}
                  placeholder="5"
                  className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleCalc1RM}
              className="w-full h-12 gradient-gold text-black font-bold rounded-xl hover:brightness-110 transition-all"
            >
              Calcular
            </button>
          </div>

          {rmResult && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "1RM", value: rmResult.rm1 },
                { label: "3RM", value: rmResult.rm3 },
                { label: "5RM", value: rmResult.rm5 },
                { label: "8RM", value: rmResult.rm8 },
                { label: "10RM", value: rmResult.rm10 },
                { label: "12RM", value: rmResult.rm12 },
              ].map((item) => (
                <div key={item.label} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 text-center">
                  <p className="font-display text-2xl text-[#FFD700]">{item.value}</p>
                  <p className="text-xs text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TDEE Calculator */}
      {activeCalc === "tdee" && (
        <div className="space-y-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Calculadora TDEE</h3>
            <p className="text-sm text-white/40">Mifflin-St Jeor</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Peso (kg)</label>
                <input
                  type="number"
                  value={tdeePeso}
                  onChange={(e) => setTdeePeso(e.target.value)}
                  placeholder="75"
                  className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Altura (cm)</label>
                <input
                  type="number"
                  value={tdeeAltura}
                  onChange={(e) => setTdeeAltura(e.target.value)}
                  placeholder="175"
                  className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Edad</label>
                <input
                  type="number"
                  value={tdeeEdad}
                  onChange={(e) => setTdeeEdad(e.target.value)}
                  placeholder="25"
                  className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Genero</label>
                <div className="flex gap-2">
                  {(["masculino", "femenino"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setTdeeGenero(g)}
                      className={`flex-1 h-12 rounded-xl text-sm font-medium transition-all ${
                        tdeeGenero === g
                          ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20"
                          : "bg-[#1E1E1E] text-white/50 border border-[#2A2A2A]"
                      }`}
                    >
                      {g === "masculino" ? "Hombre" : "Mujer"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Nivel de actividad</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { id: "sedentario" as const, label: "Sedentario" },
                  { id: "ligero" as const, label: "Ligero" },
                  { id: "moderado" as const, label: "Moderado" },
                  { id: "intenso" as const, label: "Intenso" },
                  { id: "muy_intenso" as const, label: "Muy Intenso" },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setTdeeActividad(act.id)}
                    className={`py-2 rounded-xl text-xs font-medium transition-all ${
                      tdeeActividad === act.id
                        ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20"
                        : "bg-[#1E1E1E] text-white/50 border border-[#2A2A2A]"
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCalcTDEE}
              className="w-full h-12 gradient-gold text-black font-bold rounded-xl hover:brightness-110 transition-all"
            >
              Calcular
            </button>
          </div>

          {tdeeResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "BMR", value: tdeeResult.bmr, color: "text-white" },
                { label: "TDEE", value: tdeeResult.tdee, color: "text-[#FFD700]" },
                { label: "Perder peso", value: tdeeResult.perderPeso, color: "text-green-400" },
                { label: "Ganar peso", value: tdeeResult.ganarPeso, color: "text-blue-400" },
              ].map((item) => (
                <div key={item.label} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 text-center">
                  <p className={`font-display text-2xl ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Macros Calculator */}
      {activeCalc === "macros" && (
        <div className="space-y-4">
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Calculadora de Macros</h3>
            <div>
              <label className="text-xs text-white/50 mb-1 block">TDEE (calorias)</label>
              <input
                type="number"
                value={macrosTdee}
                onChange={(e) => setMacrosTdee(e.target.value)}
                placeholder="2500"
                className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Objetivo</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "perder_peso" as const, label: "Perder peso" },
                  { id: "mantener" as const, label: "Mantener" },
                  { id: "ganar_musculo" as const, label: "Ganar musculo" },
                ].map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setMacrosObjetivo(obj.id)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      macrosObjetivo === obj.id
                        ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20"
                        : "bg-[#1E1E1E] text-white/50 border border-[#2A2A2A]"
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCalcMacros}
              className="w-full h-12 gradient-gold text-black font-bold rounded-xl hover:brightness-110 transition-all"
            >
              Calcular
            </button>
          </div>

          {macrosResult && (
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Proteinas", value: macrosResult.proteinas, color: "#FFD700" },
                  { label: "Carbs", value: macrosResult.carbohidratos || macrosResult.grasas, color: "#2196F3" },
                  { label: "Grasas", value: macrosResult.grasas, color: "#FF5722" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <p className="font-display text-3xl" style={{ color: item.color }}>{item.value}g</p>
                    <p className="text-xs text-white/40">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Proteinas", value: macrosResult.proteinas },
                        { name: "Grasas", value: macrosResult.grasas },
                        { name: "Carbs", value: macrosResult.carbohidratos || macrosResult.grasas },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroColors.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: "12px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
