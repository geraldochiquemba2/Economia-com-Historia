import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { User, Lock, Mail, ArrowRight, Loader2, Briefcase } from "lucide-react";

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
    <div className="bg-[#0F0F0F] min-h-screen flex items-center justify-center p-6 text-neutral-100 selection:bg-[#3A0310]">
      <div className="fixed top-0 left-0 w-96 h-96 bg-[#E8B4B8] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8B4B8] mb-2">Junte-se a nós</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">Cadastro</h1>
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-bold tracking-widest text-xs uppercase force-white force-white-placeholder"
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-bold tracking-widest text-xs uppercase force-white force-white-placeholder"
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-bold tracking-widest text-xs uppercase force-white force-white-placeholder"
            />
          </div>

          <div className="relative">
            <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-white/50 force-white-50" />
            <select
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-bold tracking-widest text-xs uppercase force-white appearance-none cursor-pointer"
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

        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-neutral-400">
          Já possui conta? <Link to="/login" className="text-[#E8B4B8] hover:underline">Faça Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
