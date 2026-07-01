import React, { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Lock, ArrowRight, Loader2, KeyRound } from "lucide-react";

export function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar senha");

      // Atualizar user local para remover mustChangePassword
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        delete user.mustChangePassword;
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/app");
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#3A0310]/30 border border-[#E8B4B8]/20 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-[#E8B4B8]" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8B4B8] mb-2 force-white">Nova Senha</p>
          <h1 className="text-2xl font-black uppercase tracking-tight force-white">Crie a sua nova senha</h1>
          <p className="mt-3 text-xs text-white/50 force-white">A sua senha foi redefinida. Agora crie uma nova senha de sua preferência.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/50 force-white-50" />
            <input
              type="password"
              placeholder="NOVA SENHA"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-medium text-sm force-white force-white-placeholder"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-white/50 force-white-50" />
            <input
              type="password"
              placeholder="CONFIRMAR SENHA"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/10 transition-all font-medium text-sm force-white force-white-placeholder"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#3A0310] to-[#E8B4B8] text-white font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Nova Senha"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
        <p className="mt-3 text-center text-[10px] font-bold tracking-widest text-white/40 force-white">🇦🇴 Feito em Angola</p>
      </motion.div>
    </div>
  );
}
