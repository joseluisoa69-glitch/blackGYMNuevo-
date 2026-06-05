import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import {
  auth,
  googleProvider,
  appleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "@/lib/firebase";
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const { isAuthenticated, isLoading, refresh } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isRegistering) {
        if (!name.trim()) {
          throw new Error("Por favor ingresa tu nombre.");
        }
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(credential.user, {
          displayName: name.trim(),
        });
        await credential.user.getIdToken(true);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      await refresh();
      navigate("/");
    } catch (error: any) {
      console.error("Authentication error:", error);
      let errorMsg = "Ocurrió un error al autenticar. Por favor intenta de nuevo.";
      if (error.code === "auth/email-already-in-use") {
        errorMsg = "El correo ya está registrado.";
      } else if (error.code === "auth/invalid-credential") {
        errorMsg = "Correo o contraseña incorrectos.";
      } else if (error.code === "auth/weak-password") {
        errorMsg = "La contraseña debe tener al menos 6 caracteres.";
      } else if (error.code === "auth/invalid-email") {
        errorMsg = "El correo ingresado no es válido.";
      } else if (error.message) {
        errorMsg = error.message;
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuth = async (provider: typeof googleProvider | typeof appleProvider) => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, provider);
      await refresh();
      navigate("/");
    } catch (error: any) {
      console.error("OAuth error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        setAuthError("Error al iniciar sesión con el proveedor externo.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-2 border-[#FFD700] border-t-transparent rounded-full" />
          <p className="text-white/40 text-sm">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden px-4">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFD700]/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-3">
            <img
              src="/assets/logo-blackgym.png"
              alt="BlackGYM Logo"
              className="w-24 h-24 object-contain filter drop-shadow-[0_0_20px_rgba(255,215,0,0.15)]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center border border-[#FFD700]/20 filter drop-shadow-[0_0_15px_rgba(255,215,0,0.1)]">
              <Sparkles className="w-8 h-8 text-[#FFD700]" />
            </div>
          </div>
          <h1 className="font-display text-4xl font-black tracking-wider text-white">
            Black<span className="text-[#FFD700]">GYM</span>
          </h1>
          <p className="text-[#FFD700] text-xs tracking-[6px] uppercase mt-1.5 font-semibold font-display">
            AI Training Portal
          </p>
        </motion.div>

        {/* Central Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-8 relative overflow-hidden shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-1">
            {isRegistering ? "Crear cuenta" : "Bienvenido"}
          </h2>
          <p className="text-white/50 text-sm mb-6">
            {isRegistering
              ? "Regístrate para comenzar tu rutina personalizada con IA"
              : "Inicia sesión para continuar tu entrenamiento"}
          </p>

          {/* Error Banner */}
          <AnimatePresence mode="wait">
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl flex items-start gap-2 mb-4"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isRegistering && (
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full h-[52px] pl-11 pr-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none transition-all text-sm"
                />
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              </div>
            )}
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full h-[52px] pl-11 pr-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none transition-all text-sm"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full h-[52px] pl-11 pr-12 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl text-white placeholder:text-white/30 focus:border-[#FFD700] focus:outline-none transition-all text-sm"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Submit Button Inside Form */}
            <button
              type="submit"
              className="w-full h-[52px] gradient-gold text-black font-bold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all text-sm"
            >
              {isRegistering ? "Registrarse" : "Iniciar sesión"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#2A2A2A]" />
            <span className="text-white/20 text-xs uppercase font-medium">o</span>
            <div className="flex-1 h-px bg-[#2A2A2A]" />
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth(googleProvider)}
              className="flex items-center justify-center gap-3 w-full h-[52px] bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm shadow"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth(appleProvider)}
              className="flex items-center justify-center gap-3 w-full h-[52px] bg-[#0A0A0A] border border-[#2A2A2A] text-white rounded-xl font-medium hover:bg-black/60 transition-all hover:scale-[1.01] active:scale-[0.99] text-sm shadow"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continuar con Apple
            </button>
          </div>

          {/* Toggle Register / Login */}
          <p className="text-center text-sm text-white/40 mt-6 font-medium">
            {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              className="text-[#FFD700] hover:underline font-semibold"
            >
              {isRegistering ? "Inicia sesión" : "Regístrate"}
            </button>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-6 font-medium">BlackGYM &copy; 2026</p>
      </div>
    </div>
  );
}
