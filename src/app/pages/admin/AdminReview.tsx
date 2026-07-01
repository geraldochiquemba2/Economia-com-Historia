import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardCheck, Loader2, AlertTriangle, Check, X, Eye, Clock, Image as ImageIcon, MessageSquare } from "lucide-react";

type ContentItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail: string;
  fullText: string;
  videoUrl?: string;
  featured?: boolean;
  recommended?: boolean;
  status?: string;
  authorId?: string;
  authorName?: string;
  rejectionReason?: string;
  createdAt: string;
};

export function AdminReview() {
  const [pendingItems, setPendingItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ContentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/pending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setPendingItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Não foi possível carregar conteúdos pendentes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (item: ContentItem) => {
    setProcessingId(item.id);
    try {
      const res = await fetch(`/api/content/${item.id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error();
      setPendingItems(prev => prev.filter(i => i.id !== item.id));
      window.dispatchEvent(new Event("content-reviewed"));
    } catch {
      setError("Erro ao aprovar conteúdo.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setProcessingId(rejectTarget.id);
    try {
      const res = await fetch(`/api/content/${rejectTarget.id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      if (!res.ok) throw new Error();
      setPendingItems(prev => prev.filter(i => i.id !== rejectTarget.id));
      setRejectTarget(null);
      setRejectionReason("");
    } catch {
      setError("Erro ao rejeitar conteúdo.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="relative">
      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl rounded-[2rem] overflow-hidden bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 shadow-2xl max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {previewItem.thumbnail && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img src={previewItem.thumbnail} alt="" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10 text-[#3A0310] dark:text-[#E8B4B8] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-[#3A0310] dark:border-[#E8B4B8]">
                    {({ jindungo: "Jindungo", text: "Texto", video: "Vídeo", podcast: "Áudio" }[previewItem.type] || previewItem.type)}
                  </span>
                </div>
                <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-2">{previewItem.title}</h2>
                {previewItem.authorName && (
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-3">por {previewItem.authorName}</p>
                )}
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">{previewItem.fullText || previewItem.description}</p>
                {previewItem.videoUrl && (
                  <div className="mt-4 p-3 bg-neutral-100 dark:bg-white/5 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Link do Vídeo/Áudio</p>
                    <a href={previewItem.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[#3A0310] dark:text-[#E8B4B8] text-xs font-medium break-all hover:underline">{previewItem.videoUrl}</a>
                  </div>
                )}
                <button onClick={() => setPreviewItem(null)} className="mt-6 w-full py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => { setRejectTarget(null); setRejectionReason(""); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] p-5 md:p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <X className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-black text-center text-neutral-900 dark:text-white uppercase tracking-tight mb-2">Rejeitar Conteúdo</h2>
              <p className="text-center text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-4">"{rejectTarget.title}"</p>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Motivo da rejeição (obrigatório)..."
                rows={3}
                className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-red-500 dark:focus:border-red-500/50 transition-colors resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => { setRejectTarget(null); setRejectionReason(""); }} className="flex-1 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                <button onClick={handleReject} disabled={processingId === rejectTarget.id || !rejectionReason.trim()}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white force-white font-black uppercase text-xs tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {processingId === rejectTarget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Rejeitar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-[#3A0310] border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
            <ClipboardCheck className="w-6 h-6 text-white force-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Revisão de Conteúdo</h1>
            <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">
              {pendingItems.length} conteúdo(s) pendente(s)
            </p>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Pending Items */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" />
          </div>
        ) : pendingItems.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 border-dashed">
            <ClipboardCheck className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px]">Nenhum conteúdo pendente de revisão</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pendingItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white dark:bg-white/5 border-2 border-amber-400 dark:border-amber-500/30 rounded-[1.5rem] overflow-hidden shadow-lg"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Thumbnail */}
                    {item.thumbnail && (
                      <div className="md:w-48 h-40 md:h-auto bg-neutral-100 dark:bg-[#0F0F0F] relative overflow-hidden shrink-0">
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 text-black px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                          <Clock className="w-2.5 h-2.5" /> Pendente
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10 text-[#3A0310] dark:text-[#E8B4B8] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-[#3A0310] dark:border-[#E8B4B8]">
                          {({ jindungo: "Jindungo", text: "Texto", video: "Vídeo", podcast: "Áudio" }[item.type] || item.type)}
                        </span>
                        {!item.thumbnail && (
                          <div className="flex items-center gap-1 bg-amber-400 text-black px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest">
                            <Clock className="w-2.5 h-2.5" /> Pendente
                          </div>
                        )}
                      </div>
                      <h3 className="text-[#3A0310] dark:text-white font-black text-sm uppercase tracking-tight mb-1">{item.title}</h3>
                      {item.authorName && (
                        <p className="text-[10px] font-bold text-[#3A0310]/60 dark:text-[#E8B4B8]/60 mb-1">por {item.authorName}</p>
                      )}
                      <p className="text-neutral-600 dark:text-neutral-400 text-[10px] font-medium leading-relaxed line-clamp-2 mb-4">{item.description || item.fullText}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setPreviewItem(item)}
                          className="flex items-center gap-1.5 py-2 px-3 text-[10px] font-black uppercase tracking-widest text-[#3A0310] dark:text-[#E8B4B8] bg-[#3A0310]/5 dark:bg-[#E8B4B8]/10 rounded-xl hover:bg-[#3A0310]/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver
                        </button>
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1.5 py-2 px-4 text-[10px] font-black uppercase tracking-widest text-white force-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-60"
                        >
                          {processingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          Aprovar
                        </button>
                        <button
                          onClick={() => setRejectTarget(item)}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1.5 py-2 px-4 text-[10px] font-black uppercase tracking-widest text-white force-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60"
                        >
                          <X className="w-3.5 h-3.5" /> Rejeitar
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
