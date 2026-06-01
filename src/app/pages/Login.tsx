import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Lock, Mail, ArrowRight, Loader2, ArrowLeft, Home } from "lucide-react";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro ao fazer login");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      navigate("/app");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 text-neutral-100 overflow-hidden bg-[#0F0F0F] selection:bg-[#E8B4B8]/30">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      
      {/* Decorative gradient blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-gradient-to-br from-[#3A0310] to-purple-900/40 rounded-full blur-[120px] opacity-40 pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-gradient-to-tr from-[#E8B4B8]/20 to-[#3A0310]/30 rounded-full blur-[100px] opacity-30 pointer-events-none" />

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all duration-300 group shadow-2xl"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Voltar ao Início</span>
      </Link>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8B4B8] mb-2">Bem-vindo de volta</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">Login</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-white/50 force-white-50" />
            <input 
              type="email" 
              placeholder="SEU EMAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-medium text-sm force-white force-white-placeholder"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/50 force-white-50" />
            <input 
              type="password" 
              placeholder="SUA SENHA" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-medium text-sm force-white force-white-placeholder"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3A0310] to-[#E8B4B8] text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-neutral-400">
          Não tem uma conta? <Link to="/register" className="text-[#E8B4B8] hover:underline">Cadastre-se</Link>
        </p>
      </motion.div>
    </div>
  );
}
