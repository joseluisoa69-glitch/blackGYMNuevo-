import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  User,
  Save,
  LogOut,
  Bell,
  Volume2,
  Ruler,
  Moon,
  ChevronRight,
} from "lucide-react";

export default function Perfil() {
  const { user, logout } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = trpc.profile.get.useQuery(undefined, {
    enabled: !!user,
  });
  const utils = trpc.useUtils();

  const [form, setForm] = useState<{
    nombre: string;
    pesoKg: string;
    alturaCm: string;
    objetivo: "perder_peso" | "ganar_musculo" | "mantener" | "fuerza" | "resistencia";
    nivel: "principiante" | "intermedio" | "avanzado";
    diasSemana: number;
    tiempoSesion: number;
    lesiones: string;
  }>({
    nombre: "",
    pesoKg: "",
    alturaCm: "",
    objetivo: "mantener",
    nivel: "intermedio",
    diasSemana: 3,
    tiempoSesion: 60,
    lesiones: "",
  });

  // Sincronizar form cuando llegan los datos del servidor
  useEffect(() => {
    if (profile) {
      setForm({
        nombre: profile.nombre || user?.name || "",
        pesoKg: profile.pesoKg?.toString() || "",
        alturaCm: profile.alturaCm?.toString() || "",
        objetivo: profile.objetivo || "mantener",
        nivel: profile.nivel || "intermedio",
        diasSemana: profile.diasSemana || 3,
        tiempoSesion: profile.tiempoSesion || 60,
        lesiones: profile.lesiones || "",
      });
    } else if (user) {
      setForm((prev) => ({
        ...prev,
        nombre: prev.nombre || user.name || "",
      }));
    }
  }, [profile, user]);

  const upsertProfile = trpc.profile.upsert.useMutation({
    onSuccess: () => {
      utils.profile.get.invalidate();
    },
  });

  const handleSave = () => {
    upsertProfile.mutate({
      nombre: form.nombre || undefined,
      pesoKg: form.pesoKg ? parseFloat(form.pesoKg) : undefined,
      alturaCm: form.alturaCm ? parseInt(form.alturaCm) : undefined,
      objetivo: form.objetivo as "perder_peso" | "ganar_musculo" | "mantener" | "fuerza" | "resistencia",
      nivel: form.nivel as "principiante" | "intermedio" | "avanzado",
      diasSemana: form.diasSemana,
      tiempoSesion: form.tiempoSesion,
      lesiones: form.lesiones || undefined,
    });
  };

  if (isProfileLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FFD700]"></div></div>;

  const objetivos: { id: "perder_peso" | "ganar_musculo" | "mantener" | "fuerza" | "resistencia"; label: string }[] = [
    { id: "perder_peso", label: "Perder Peso" },
    { id: "ganar_musculo", label: "Ganar Musculo" },
    { id: "mantener", label: "Mantener" },
    { id: "fuerza", label: "Fuerza" },
    { id: "resistencia", label: "Resistencia" },
  ];

  const niveles: { id: "principiante" | "intermedio" | "avanzado"; label: string }[] = [
    { id: "principiante", label: "Principiante" },
    { id: "intermedio", label: "Intermedio" },
    { id: "avanzado", label: "Avanzado" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <User className="w-6 h-6 text-[#FFD700]" />
        Perfil
      </h1>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#141414] to-[#1a1a1a] border border-[#2A2A2A] rounded-2xl p-6 flex items-center gap-4">
        <div className="w-20 h-20 bg-[#FFD700]/10 rounded-full flex items-center justify-center border-2 border-[#FFD700]/20">
          <span className="font-display text-2xl text-[#FFD700]">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{user?.name || "Usuario"}</h2>
          <p className="text-sm text-white/50">{user?.email}</p>
          <p className="text-xs text-white/30 mt-1">
            Miembro desde {new Date(user?.createdAt || Date.now()).toLocaleDateString("es-ES")}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Informacion Personal</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Tu nombre"
              className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Peso (kg)</label>
            <input
              type="number"
              value={form.pesoKg}
              onChange={(e) => setForm({ ...form, pesoKg: e.target.value })}
              placeholder="75"
              className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Altura (cm)</label>
            <input
              type="number"
              value={form.alturaCm}
              onChange={(e) => setForm({ ...form, alturaCm: e.target.value })}
              placeholder="175"
              className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Dias/semana</label>
            <input
              type="number"
              min={1}
              max={7}
              value={form.diasSemana}
              onChange={(e) => setForm({ ...form, diasSemana: parseInt(e.target.value) || 3 })}
              className="w-full h-12 px-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none"
            />
          </div>
        </div>

        {/* Objetivo */}
        <div>
          <label className="text-xs text-white/50 mb-2 block">Objetivo</label>
          <div className="flex flex-wrap gap-2">
            {objetivos.map((obj) => (
              <button
                key={obj.id}
                onClick={() => setForm({ ...form, objetivo: obj.id })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  form.objetivo === obj.id
                    ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20"
                    : "bg-[#1E1E1E] text-white/50 border border-[#2A2A2A]"
                }`}
              >
                {obj.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nivel */}
        <div>
          <label className="text-xs text-white/50 mb-2 block">Nivel</label>
          <div className="flex gap-2">
            {niveles.map((niv) => (
              <button
                key={niv.id}
                onClick={() => setForm({ ...form, nivel: niv.id })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  form.nivel === niv.id
                    ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20"
                    : "bg-[#1E1E1E] text-white/50 border border-[#2A2A2A]"
                }`}
              >
                {niv.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lesiones */}
        <div>
          <label className="text-xs text-white/50 mb-1 block">Lesiones o Limitaciones</label>
          <textarea
            value={form.lesiones}
            onChange={(e) => setForm({ ...form, lesiones: e.target.value })}
            placeholder="Describe cualquier lesion..."
            rows={3}
            className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={upsertProfile.isPending}
          className="w-full h-12 gradient-gold text-black font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {upsertProfile.isPending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {/* Settings */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A]">
          <h3 className="text-lg font-semibold text-white">Configuracion</h3>
        </div>
        <div className="divide-y divide-[#2A2A2A]">
          {[
            { icon: Bell, label: "Notificaciones", value: "Activadas" },
            { icon: Volume2, label: "Sonido de Timer", value: "Activado" },
            { icon: Ruler, label: "Unidades", value: "Metrico (kg/cm)" },
            { icon: Moon, label: "Tema", value: "Oscuro" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-white/30" />
                <span className="text-sm text-white/70">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">{item.value}</span>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full h-12 bg-red-500/10 border border-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Cerrar Sesion
      </button>
    </div>
  );
}