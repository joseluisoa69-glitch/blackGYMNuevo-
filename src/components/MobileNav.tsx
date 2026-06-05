import { Link, useLocation } from "react-router";
import { Home, ClipboardList, Dumbbell, TrendingUp, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "Inicio" },
  { path: "/mirutina", icon: ClipboardList, label: "Mi Rutina" },
  { path: "/entrenar", icon: Dumbbell, label: "Entrenar" },
  { path: "/progreso", icon: TrendingUp, label: "Progreso" },
  { path: "/perfil", icon: User, label: "Perfil" },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#141414]/95 backdrop-blur-lg border-t border-[#2A2A2A] z-50 md:hidden">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-all ${
                isActive ? "text-[#FFD700]" : "text-white/40"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
