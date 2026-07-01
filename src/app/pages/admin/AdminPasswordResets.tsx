import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { KeyRound, Loader2, CheckCircle2, Clock, Mail, Send, User } from "lucide-react";

interface PasswordResetRequest {
  id: string;
  userId: string;
  status: string;
  newPassword: string | null;
  requestedAt: string;
  resetAt: string | null;
  sentAt: string | null;
  name: string;
  email: string;
  avatar: string | null;
}

export function AdminPasswordResets() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/password-resets", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch { /* ignorar */ }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleReset = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/password-resets/${id}/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch { /* ignorar */ }
    setProcessingId(null);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8B4B8]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#3A0310]/10 dark:bg-white/5 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white">Pedidos de Redefinição</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{pendingRequests.length} pedido(s) pendente(s)</p>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length === 0 ? (
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/10 p-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">Nenhum pedido pendente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-white/5 rounded-2xl border-2 border-amber-400/50 dark:border-amber-500/30 p-5 shadow-lg"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center font-black text-lg force-white shadow-inner border border-[#E8B4B8]/20 overflow-hidden shrink-0">
                  {req.avatar ? (
                    <img src={req.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-sm text-[#3A0310] dark:text-white truncate">{req.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Pendente
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Mail className="w-3 h-3" />
                    <span>{req.email}</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                    Pedido em: {new Date(req.requestedAt).toLocaleString('pt-AO')}
                  </p>
                </div>

                <button
                  onClick={() => handleReset(req.id)}
                  disabled={processingId === req.id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest bg-gradient-to-r from-[#3A0310] to-[#E8B4B8] text-white force-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md shrink-0"
                >
                  {processingId === req.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Resetar Senha
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">Já Processados</h2>
          <div className="space-y-3">
            {processedRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10 p-4 opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {req.avatar ? (
                      <img src={req.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-[#3A0310] dark:text-white truncate">{req.name}</p>
                    <p className="text-[10px] text-neutral-400">{req.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[8px] font-black uppercase tracking-widest">
                    {req.status === 'sent' ? 'Enviado' : req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
