import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Bookmark, ChevronRight, Loader2, MessageSquare, Compass, PlayCircle, FileText, Mic } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function SavedDebates() {
  const navigate = useNavigate();
  const [forumFavorites, setForumFavorites] = useState<any[]>([]);
  const [savedContents, setSavedContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (user?.id) {
      fetch(`/api/users/${user.id}/saved`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setForumFavorites(data.filter((d: any) => d.type === 'forum'));
            setSavedContents(data.filter((d: any) => d.type !== 'forum'));
          } else {
            setForumFavorites([]);
            setSavedContents([]);
          }
        })
        .catch(() => {
          setForumFavorites([]);
          setSavedContents([]);
        })
        .finally(() => setLoading(false));
    } else {
      setForumFavorites([]);
      setSavedContents([]);
      setLoading(false);
    }
  }, []);

  const removeSavedContent = (id: string, type: 'forum' | 'content') => {
    if (type === 'forum') {
      setForumFavorites(forumFavorites.filter(f => f.id !== id));
    } else {
      setSavedContents(savedContents.filter(c => c.id !== id));
    }
    
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.id) {
        fetch(`/api/users/${user.id}/saved/${id}`, { method: 'DELETE' }).catch(console.error);
      }
    } catch {}
  };

  const totalSaved = forumFavorites.length + savedContents.length;

  const typeIcon = (type: string) => {
    switch (type) {
      case "video": return <PlayCircle className="w-4 h-4" />;
      case "text": return <FileText className="w-4 h-4" />;
      case "podcast": return <Mic className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

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
            Elementos Guardados
          </h1>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
            {totalSaved} {totalSaved === 1 ? "item guardado" : "itens guardados"}
          </p>
        </div>
      </motion.div>

      <div className="px-4 pt-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[#3A0310] dark:text-[#E8B4B8] animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">A carregar...</p>
          </div>
        ) : totalSaved === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3A0310]/10 to-[#3A0310]/5 dark:from-white/5 dark:to-white/0 flex items-center justify-center border border-[#3A0310]/10 dark:border-white/5">
              <Bookmark className="w-8 h-8 text-[#3A0310]/40 dark:text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-tight text-neutral-500 dark:text-neutral-400 mb-1">
                Nenhum item guardado ainda
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium max-w-xs">
                No Fórum ou no Explorar, clique no ícone de guardar num conteúdo para o encontrar aqui rapidamente.
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
          <>
            {/* Conteúdos Guardados */}
            {savedContents.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 ml-2">
                  Conteúdos (Explorar)
                </h2>
                {savedContents.map((content, index) => (
                  <motion.div
                    key={content.id || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-[#E8B4B8] rounded-2xl overflow-hidden shadow-sm group hover:border-[#5A051A] dark:hover:border-[#F2C8CB] transition-all"
                  >
                    <div className="w-full p-4 flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 relative border border-black/5 cursor-pointer"
                        onClick={() => navigate(`/app/explore/${content.id}`)}
                      >
                        {content.thumbnail ? (
                          <img src={content.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#3A0310]/10 flex items-center justify-center">
                            {typeIcon(content.type)}
                          </div>
                        )}
                      </div>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/app/explore/${content.id}`)}
                      >
                        <h3 className="text-xs md:text-sm font-black uppercase tracking-tight text-neutral-800 dark:text-white group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors line-clamp-1 mb-0.5">
                          {content.title || "Conteúdo"}
                        </h3>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest">
                          {content.type === "video" ? "Vídeo" : content.type === "text" ? "Texto" : content.type === "podcast" ? "Podcast" : content.type === "jindungo" ? "Com Jindungo" : content.type}
                        </p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); removeSavedContent(content.id, 'content'); }}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 border border-red-200 dark:border-red-500/20"
                        title="Remover dos guardados"
                      >
                        <Bookmark className="w-3 h-3 fill-current" />
                        Remover
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Debates Guardados */}
            {forumFavorites.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 ml-2 mt-4">
                  Debates (Fórum)
                </h2>
                {forumFavorites.map((fav, index) => (
                  <motion.div
                    key={fav.id || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-full bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-[#E8B4B8] rounded-2xl overflow-hidden shadow-sm group hover:border-[#5A051A] dark:hover:border-[#F2C8CB] transition-all"
                  >
                    <div className="w-full p-4 flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3A0310]/10 to-[#3A0310]/5 dark:from-white/10 dark:to-white/5 flex items-center justify-center flex-shrink-0 border border-[#3A0310]/10 dark:border-white/5 cursor-pointer"
                        onClick={() => navigate(`/app/forum/${fav.id}`)}
                      >
                        <MessageSquare className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" />
                      </div>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => navigate(`/app/forum/${fav.id}`)}
                      >
                        <h3 className="text-xs md:text-sm font-black uppercase tracking-tight text-neutral-800 dark:text-white group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors line-clamp-1 mb-0.5">
                          {fav.title || "Debate"}
                        </h3>
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest">
                          {fav.author && `${fav.author} • `}{fav.date || ""}
                        </p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); removeSavedContent(fav.id, 'forum'); }}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 dark:text-red-400 font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 border border-red-200 dark:border-red-500/20"
                        title="Remover dos guardados"
                      >
                        <Bookmark className="w-3 h-3 fill-current" />
                        Remover
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SavedDebates;
