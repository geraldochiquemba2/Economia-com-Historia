import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { User, Lock, Mail, ArrowRight, Loader2, Briefcase, ArrowLeft, Home } from "lucide-react";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("Estudante");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, profession }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Erro ao fazer cadastro");

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
    <div className="relative min-h-screen flex items-center justify-center p-6 text-neutral-100 overflow-hidden bg-[#0a0508] selection:bg-[#E8B4B8]/30">
      {/* Animated background */}
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(232,180,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,180,184,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white force-white font-black uppercase tracking-widest text-[10px] transition-all duration-300 group shadow-2xl"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Voltar ao Início</span>
      </Link>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8B4B8] mb-2 force-white">Junte-se a nós</p>
          <h1 className="text-3xl font-black uppercase tracking-tight force-white">Cadastro</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="relative">
            <User className="absolute left-4 top-3.5 w-5 h-5 text-white/50 force-white-50" />
            <input 
              type="text" 
              placeholder="SEU NOME" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-medium text-sm force-white force-white-placeholder"
            />
          </div>

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
              placeholder="CRIE UMA SENHA" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-medium text-sm force-white force-white-placeholder"
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-white/50 force-white-50" />
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-medium text-sm force-white appearance-none cursor-pointer"
            >
              <option value="Estudante" className="bg-[#0F0F0F] text-white">ESTUDANTE</option>
              <option value="Docente" className="bg-[#0F0F0F] text-white">DOCENTE</option>
              <option value="Trabalhador" className="bg-[#0F0F0F] text-white">TRABALHADOR</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#E8B4B8] to-[#3A0310] text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Conta"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest force-white">
          Já possui conta? <Link to="/login" className="text-[#E8B4B8] hover:underline force-white">Faça Login</Link>
        </p>
        <p className="mt-3 text-center text-[10px] font-bold tracking-widest text-white/40 force-white">🇦🇴 Feito em Angola</p>
      </motion.div>
    </div>
  );
}
