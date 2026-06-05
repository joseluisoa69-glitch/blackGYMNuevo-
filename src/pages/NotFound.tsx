import { Link } from "react-router";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-display text-8xl text-[#FFD700] mb-4">404</h1>
        <h2 className="text-xl font-bold text-white mb-2">Pagina no encontrada</h2>
        <p className="text-white/50 text-sm mb-6">La pagina que buscas no existe.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 gradient-gold text-black font-bold rounded-xl hover:brightness-110 transition-all"
        >
          <Home className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
