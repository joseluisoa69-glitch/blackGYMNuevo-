import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/AppShell";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Explorar from "@/pages/Explorar";
import Rutina from "@/pages/Rutina";
import Entrenar from "@/pages/Entrenar";
import Progreso from "@/pages/Progreso";
import Calculadoras from "@/pages/Calculadoras";
import Perfil from "@/pages/Perfil";
import MiRutina from "@/pages/MiRutina";
import NotFound from "@/pages/NotFound";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-2 border-[#FFD700] border-t-transparent rounded-full" />
          <p className="text-white/40 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/explorar" element={isAuthenticated ? <Explorar /> : <Navigate to="/login" replace />} />
        <Route path="/rutina" element={isAuthenticated ? <Rutina /> : <Navigate to="/login" replace />} />
        <Route path="/entrenar" element={isAuthenticated ? <Entrenar /> : <Navigate to="/login" replace />} />
        <Route path="/progreso" element={isAuthenticated ? <Progreso /> : <Navigate to="/login" replace />} />
        <Route path="/calculadoras" element={isAuthenticated ? <Calculadoras /> : <Navigate to="/login" replace />} />
        <Route path="/perfil" element={isAuthenticated ? <Perfil /> : <Navigate to="/login" replace />} />
        <Route path="/mirutina" element={isAuthenticated ? <MiRutina /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
