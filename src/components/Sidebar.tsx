import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store/useStore";
import {
  Home,
  Sparkles,
  Dumbbell,
  TrendingUp,
  Calculator,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Flame,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const navItems = [
  { path: "/", icon: Home, label: "Inicio" },
  { path: "/mirutina", icon: ClipboardList, label: "Mi Rutina" },
  { path: "/rutina", icon: Sparkles, label: "Rutina AI" },
  { path: "/entrenar", icon: Dumbbell, label: "Entrenar" },
  { path: "/progreso", icon: TrendingUp, label: "Progreso" },
  { path: "/calculadoras", icon: Calculator, label: "Calculadoras" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

export default function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useStore();
  const { logout } = useAuth();
  const { data: streak } = trpc.streak.get.useQuery();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-[#0D0D0D] to-[#141414] border-r border-[#2A2A2A] z-50 transition-all duration-300 flex flex-col ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-20 border-b border-[#2A2A2A]">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/logo-blackgym.png"
            alt="BlackGYM"
            className="w-10 h-10 object-contain"
          />
          {sidebarOpen && (
            <span className="font-display text-lg font-bold text-[#FFD700] tracking-wider">
              BlackGYM
            </span>
          )}
        </Link>
      </div>

      {/* Streak Indicator */}
      {streak && (streak.currentStreak || 0) > 0 && (
        <div className={`flex items-center gap-2 px-4 py-3 border-b border-[#2A2A2A] ${!sidebarOpen && "justify-center"}`}>
          <div className="relative">
            <Flame className="w-6 h-6 text-[#FF5722] animate-fire-pulse" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-display text-lg text-[#FFD700] leading-none">
                {streak.currentStreak}
              </div>
              <div className="text-xs text-white/50">dias</div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive && "text-[#FFD700]"}`} />
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-[#2A2A2A] p-2 space-y-1">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
          {sidebarOpen && <span className="text-sm font-medium">Colapsar</span>}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="text-sm font-medium">Salir</span>}
        </button>
      </div>
    </aside>
  );
}
