import { Routes, Route } from "react-router";
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
  const { isAuthenticated } = useAuth();

  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Login />} />
        <Route path="/explorar" element={isAuthenticated ? <Explorar /> : <Login />} />
        <Route path="/rutina" element={isAuthenticated ? <Rutina /> : <Login />} />
        <Route path="/entrenar" element={isAuthenticated ? <Entrenar /> : <Login />} />
        <Route path="/progreso" element={isAuthenticated ? <Progreso /> : <Login />} />
        <Route path="/calculadoras" element={isAuthenticated ? <Calculadoras /> : <Login />} />
        <Route path="/perfil" element={isAuthenticated ? <Perfil /> : <Login />} />
        <Route path="/mirutina" element={isAuthenticated ? <MiRutina /> : <Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
