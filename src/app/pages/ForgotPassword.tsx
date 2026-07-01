import React, { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Mail, ArrowRight, Loader2, ArrowLeft, KeyRound } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar pedido");
      setSuccess(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 text-neutral-100 overflow-hidden bg-[#0a0508] selection:bg-[#E8B4B8]/30">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1447069387593-a5de0862481e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(232,180,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(232,180,184,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <Link
        to="/login"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white force-white font-black uppercase tracking-widest text-[10px] transition-all duration-300 group shadow-2xl"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">Voltar ao Login</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#3A0310]/30 border border-[#E8B4B8]/20 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-[#E8B4B8]" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8B4B8] mb-2 force-white">Recuperação de senha</p>
          <h1 className="text-2xl font-black uppercase tracking-tight force-white">Esqueceu a senha?</h1>
          <p className="mt-3 text-xs text-white/50 force-white">Insira o email da sua conta e o administrador irá processar o pedido de redefinição.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl mb-6 text-sm text-center font-bold leading-relaxed">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#3A0310] to-[#E8B4B8] text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pedir Nova Senha"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest force-white">
          Lembrou a senha? <Link to="/login" className="text-[#E8B4B8] hover:underline force-white">Fazer Login</Link>
        </p>
        <p className="mt-3 text-center text-[10px] font-bold tracking-widest text-white/40 force-white">🇦🇴 Feito em Angola</p>
      </motion.div>
    </div>
  );
}
