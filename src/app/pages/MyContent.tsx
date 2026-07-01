import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import { FileText, Loader2, AlertTriangle, Image as ImageIcon, Clock, ArrowLeft, X, Check, RotateCcw } from "lucide-react";

type ContentItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail: string;
  fullText: string;
  videoUrl?: string;
  status?: string;
  rejectionReason?: string;
  createdAt: string;
};

export function MyContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('dismissedContentIds');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const dismissItem = (id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('dismissedContentIds', JSON.stringify([...next]));
      return next;
    });
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const res = await fetch(`/api/content/${id}/cancel`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      setError("Erro ao cancelar conteúdo.");
    } finally {
      setCancellingId(null);
    }
  };

  const fetchMyContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content/my", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Não foi possível carregar os teus conteúdos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyContent(); }, []);

  const statusColor = (s: string) => {
    if (s === 'approved') return 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-400 dark:border-green-500/30';
    if (s === 'pending') return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400 dark:border-amber-500/30';
    if (s === 'rejected') return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-400 dark:border-red-500/30';
    return 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-white/20';
  };

  const statusLabel = (s: string) => {
    if (s === 'approved') return 'Aprovado';
    if (s === 'pending') return 'Pendente';
    if (s === 'rejected') return 'Rejeitado';
    return s;
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
        <Link to="/app/create" className="w-12 h-12 rounded-2xl bg-neutral-200 dark:bg-white/10 border border-neutral-300 dark:border-white/20 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-[#3A0310] dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Os Meus Conteúdos</h1>
          <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">
            {items.length} conteúdo(s) criado(s)
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 border-dashed">
          <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px] mb-4">Ainda não criaste conteúdo</p>
          <Link to="/app/create" className="inline-flex items-center gap-2 bg-[#3A0310] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#5A051A] transition-colors">
            Criar Primeiro Conteúdo
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
          {items.filter(i => i.status !== 'rejected' || !dismissedIds.has(i.id)).map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.04 }}
              className={`bg-white dark:bg-white/5 rounded-2xl border-2 transition-all ${
                item.status === 'approved' ? 'border-green-400 dark:border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' :
                item.status === 'rejected' ? 'border-red-400 dark:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                'border-amber-400 dark:border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
              }`}
            >
              <div className={`p-4 flex items-center gap-4 ${item.status === 'rejected' ? 'flex-col sm:flex-row' : ''}`}>
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-white/10" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-white/10">
                    <ImageIcon className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm text-[#3A0310] dark:text-white uppercase tracking-tight truncate">{item.title}</h3>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium truncate">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${statusColor(item.status || 'pending')}`}>
                      {statusLabel(item.status || 'pending')}
                    </span>
                    {item.createdAt && (
                      <span className="flex items-center gap-1 text-[8px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
                        <Clock className="w-2.5 h-2.5" /> {formatDate(item.createdAt)}
                      </span>
                    )}
                  </div>
                  {item.status === 'rejected' && item.rejectionReason && (
                    <p className="text-[10px] text-red-500 dark:text-red-400 font-medium mt-2 bg-red-50 dark:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20">
                      Motivo: {item.rejectionReason}
                    </p>
                  )}
                </div>
                {item.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(item.id)}
                    disabled={cancellingId === item.id}
                    className="shrink-0 flex items-center gap-1.5 py-2 px-3 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-60 border border-red-200 dark:border-red-500/30"
                  >
                    {cancellingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    Cancelar
                  </button>
                )}
              </div>
              {item.status === 'rejected' && (
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => dismissItem(item.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#3A0310] dark:text-[#E8B4B8] bg-neutral-100 dark:bg-white/5 rounded-xl hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors border border-neutral-200 dark:border-white/10"
                  >
                    <Check className="w-3.5 h-3.5" /> OK
                  </button>
                  <Link
                    to="/app/create"
                    onClick={() => {
                      localStorage.setItem('retryContent', JSON.stringify({
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        type: item.type,
                        fullText: item.fullText || '',
                        thumbnail: item.thumbnail || '',
                        videoUrl: item.videoUrl || '',
                      }));
                      dismissItem(item.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white force-white bg-[#3A0310] dark:bg-[#E8B4B8] dark:text-[#3A0310] rounded-xl hover:opacity-90 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Tentar Novamente
                  </Link>
                </div>
              )}
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
