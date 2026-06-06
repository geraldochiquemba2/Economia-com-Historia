import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";

export function CompletedStudies() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const [studies, setStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetch(`/api/users/${user.id}/completed`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setStudies(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  return (
    <div className="min-h-screen pb-24 md:max-w-3xl md:mx-auto md:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-30 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-neutral-100 dark:border-white/5 px-4 py-4 flex items-center gap-4"
      >
        <button
          onClick={() => navigate("/app/profile")}
          className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/10 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
        </button>
        <div>
          <h1 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            Estudos Concluídos
          </h1>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
            {studies.length} {studies.length === 1 ? "estudo concluído" : "estudos concluídos"}
          </p>
        </div>
      </motion.div>

      <div className="px-4 pt-6 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[#3A0310] dark:text-[#E8B4B8] animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">A carregar...</p>
          </div>
        ) : studies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3A0310]/10 to-[#3A0310]/5 dark:from-white/5 dark:to-white/0 flex items-center justify-center border border-[#3A0310]/10 dark:border-white/5">
              <BookOpen className="w-8 h-8 text-[#3A0310]/40 dark:text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-tight text-neutral-500 dark:text-neutral-400 mb-1">
                Nenhum estudo concluído ainda
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium max-w-xs">
                Explore os conteúdos e clique em "Concluir Estudo" para registar o seu progresso aqui.
              </p>
            </div>
            <button
              onClick={() => navigate("/app/explore")}
              className="mt-2 px-6 py-3 bg-[#3A0310] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#5A051A] transition-all active:scale-[0.98] shadow-lg shadow-[#3A0310]/20"
            >
              Explorar Conteúdos
            </button>
          </motion.div>
        ) : (
          studies.map((study, index) => (
            <motion.button
              key={study.contentId || index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/app/explore/${study.contentId}`)}
              className="w-full bg-white dark:bg-white/5 border border-neutral-100 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-white/[0.07] hover:border-[#3A0310]/20 dark:hover:border-white/10 transition-all group active:scale-[0.99] shadow-sm text-left"
            >
              {/* Thumbnail */}
              <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-white/5">
                {study.thumbnail ? (
                  <img src={study.thumbnail} alt={study.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xs md:text-sm font-black uppercase tracking-tight text-neutral-800 dark:text-white group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors line-clamp-1 mb-1">
                  {study.title || "Conteúdo"}
                </h3>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest">
                    {study.type || "Estudo"} • Concluído em{" "}
                    {new Date(study.completedAt).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0 group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
