import React, { useState, useEffect } from "react";
import { Link, MemoryRouter, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { PlayCircle, FileText, Mic, Search, Compass, ArrowLeft, Loader2, MessageSquare, Bookmark, ThumbsUp, ThumbsDown, MessageCircle, Flame } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type ContentItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail: string;
  fullText?: string;
  videoUrl?: string;
};

export function Explore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";
  
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState<"recent" | "oldest" | "popular">("recent");
  const [search, setSearch] = useState("");
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedContents, setSavedContents] = useState<any[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [eliteRequestStatus, setEliteRequestStatus] = useState<string | null>(null);

  // Sync initial filter if URL changes
  useEffect(() => {
    const f = searchParams.get("filter");
    if (f) setFilter(f);
  }, [searchParams]);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.id) {
        fetch(`/api/users/${user.id}/saved`)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data)) setSavedContents(data);
            else setSavedContents([]);
          })
          .catch(() => setSavedContents([]));
        // Verificar status do pedido elite
        fetch(`/api/elite-requests/user/${user.id}`)
          .then(r => r.json())
          .then(data => setEliteRequestStatus(data?.status || null))
          .catch(() => {});
      } else {
        setSavedContents([]);
      }
    } catch {
      setSavedContents([]);
    }
  }, []);

  const toggleSave = (e: React.MouseEvent, content: ContentItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error('Ação não permitida', {
        description: 'Deve estar logado para poder guardar conteúdos.'
      });
      return;
    }
    
    const parsedUser = JSON.parse(user);
    const userId = parsedUser.id;

    // Bloquear guardar conteúdo Jindungo para não-Elite
    if (content.type === 'jindungo' && parsedUser.role !== 'elite' && parsedUser.role !== 'admin') {
      toast.error('Acesso Restrito 🔥', {
        description: 'Só membros Elite podem guardar Textos com Jindungo. Solicita o acesso no teu Perfil.'
      });
      return;
    }

    const updated = [...savedContents];
    const index = updated.findIndex(c => c.id === content.id);

    if (index >= 0) {
      updated.splice(index, 1);
      fetch(`/api/users/${userId}/saved/${content.id}`, { method: 'DELETE' }).catch(console.error);
      toast.success('Removido dos guardados!');
    } else {
      updated.push(content);
      fetch(`/api/users/${userId}/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: content.id })
      }).catch(console.error);
      toast.success('Guardado!', { description: 'Podes aceder em qualquer altura no teu Perfil.' });
    }
    setSavedContents(updated);
  };

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setContents(list);
        // Buscar contagem de comentários para cada conteúdo
        Promise.all(
          list.map((c: ContentItem) =>
            fetch(`/api/comments/${encodeURIComponent(c.id)}`)
              .then(r => r.json())
              .then(comments => ({ id: c.id, count: Array.isArray(comments) ? comments.length : 0 }))
              .catch(() => ({ id: c.id, count: 0 }))
          )
        ).then(results => {
          const counts: Record<string, number> = {};
          results.forEach(({ id, count }) => { counts[id] = count; });
          setCommentCounts(counts);
        });
      })
      .catch(() => setContents([]))
      .finally(() => setLoading(false));
  }, []);

  const getContentStats = (content: any) => {
    try {
      const likes = content.likes?.length || 0;
      const dislikes = content.dislikes?.length || 0;
      return { likes, dislikes, comments: commentCounts[content.id] ?? 0 };
    } catch {
      return { likes: 0, dislikes: 0, comments: commentCounts[content.id] ?? 0 };
    }
  };

  const filtered = (() => {
    let list = contents.filter((c) => {
      const matchType = filter === "all" || c.type === filter;
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });

    if (sort === "oldest") {
      // Assume IDs are sequential – lower id = older
      list = [...list].sort((a, b) => Number(a.id) - Number(b.id));
    } else if (sort === "popular") {
      list = [...list].sort((a, b) => {
        const statsA = getContentStats(a);
        const statsB = getContentStats(b);
        return (statsB.likes + statsB.comments) - (statsA.likes + statsA.comments);
      });
    } else {
      // recent: higher id = newer
      list = [...list].sort((a, b) => Number(b.id) - Number(a.id));
    }
    return list;
  })();

  const handleCancelEliteRequest = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const u = JSON.parse(userStr);
    try {
      await fetch(`/api/elite-requests/user/${u.id}`, { method: 'DELETE' });
      setEliteRequestStatus(null);
      toast.success('Pedido cancelado!', { description: 'Podes solicitar novamente quando quiseres.' });
    } catch {
      toast.error('Erro ao cancelar pedido.');
    }
  };

  const typeIcon = (type: string) => {
    if (type === "video") return <PlayCircle className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1.5" />;
    if (type === "text") return <FileText className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1.5" />;
    if (type === "podcast") return <Mic className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1.5" />;
    if (type === "forum") return <MessageSquare className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1.5" />;
    if (type === "jindungo") return <span className="mr-0.5 md:mr-1.5">🔥</span>;
    return null;
  };

  const typeLabel = (type: string) => {
    if (type === "jindungo") return "Texto com Jindungo 🔥";
    if (type === "podcast") return "Áudio";
    if (type === "text") return "Leitura";
    if (type === "forum") return "Fórum";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 sticky top-0 z-50 md:relative md:top-auto border-b md:border border-white/10/5 dark:border-white/5 bg-white/90 dark:bg-black/90 backdrop-blur-xl md:rounded-[2rem] md:mt-6 md:p-10 md:px-10 shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#0a0a0a]/5 dark:bg-[#0a0a0a]/30 rounded-2xl border border-white/10/20 dark:border-white/10/50 shadow-inner">
            <Compass className="w-6 h-6 text-[#3A0310] dark:text-[#E8B4B8]" />
          </div>
          <div>
            <h1 className="text-2xl font-medium text-neutral-800 dark:text-white tracking-tight uppercase">Explorar</h1>
            <p className="text-[10px] text-neutral-400 dark:text-white uppercase tracking-wide font-medium">Conhecimento de Prestígio</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-400 dark:text-white" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="O que procuras?"
            className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-white/10/50 focus:bg-neutral-100 dark:focus:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {["all", "jindungo", "video", "text", "podcast", "forum"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-xs font-medium uppercase tracking-wider md:tracking-wide transition-all border whitespace-nowrap active:scale-95 shadow-sm flex-shrink-0 ${
                filter === f
                  ? "bg-[#0a0a0a] border-[#E8B4B8]/30 shadow-[0_4px_15px_rgba(58,3,16,0.25)]"
                  : "bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-white border-neutral-200 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#3A0310] dark:hover:text-white"
              }`}
              style={filter === f ? { color: "white" } : {}}
            >
              {f === "all" && "Todos"}
              {f === "jindungo" && "Texto com Jindungo 🔥"}
              {f === "video" && "Vídeos"}
              {f === "text" && "Leituras"}
              {f === "podcast" && "Áudios"}
              {f === "forum" && "Fórum"}
            </button>
          ))}
        </div>

        {/* Sort buttons */}
        <div className="flex gap-1.5 mt-3">
          {(["recent", "oldest", "popular"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-xl text-[8px] md:text-[10px] font-medium uppercase tracking-wide transition-all border whitespace-nowrap active:scale-95 flex-shrink-0 ${
                sort === s
                  ? "bg-[#0a0a0a] force-white border-[#E8B4B8]/30 shadow-[0_4px_15px_rgba(58,3,16,0.25)]"
                  : "bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-white border-neutral-200 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/10"
              }`}
            >
              {s === "recent" && "Mais Recentes"}
              {s === "oldest" && "Mais Antigos"}
              {s === "popular" && "Mais Destacados"}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <div className="p-6 space-y-6">
        {filter === 'jindungo' && !localStorage.getItem('user') && (
          <div className="bg-[#0a0a0a] border border-[#E8B4B8]/30 p-8 rounded-[2rem] text-center shadow-md relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none" />
             <div className="relative z-10 flex flex-col items-center">
               <Flame className="w-12 h-12 mb-4" style={{ color: '#E8B4B8' }} />
               <h3 className="text-2xl font-medium uppercase tracking-tight mb-2" style={{ color: '#ffffff' }}>Acesso Restrito</h3>
               <p className="text-sm font-medium mb-6" style={{ color: '#d4d4d4' }}>Faz login ou regista-te para teres acesso exclusivo aos Textos com Jindungo 🔥.</p>
               <div className="flex gap-3">
                 <Link to="/login" className="inline-block bg-white font-medium text-[11px] uppercase tracking-wide px-6 py-3.5 rounded-xl hover:scale-105 active:scale-95 transition-all" style={{ color: '#3A0310' }}>
                   Fazer Login
                 </Link>
                 <Link to="/register" className="inline-block bg-black/20 border border-white/20 font-medium text-[11px] uppercase tracking-wide px-6 py-3.5 rounded-xl hover:bg-black/40 hover:scale-105 active:scale-95 transition-all" style={{ color: '#ffffff' }}>
                   Cadastrar
                 </Link>
               </div>
             </div>
          </div>
        )}

        {filter === 'jindungo' && (() => {
          const userStr = localStorage.getItem('user');
          if (!userStr) return null;
          const u = JSON.parse(userStr);
          if (u.role === 'elite' || u.role === 'admin') return null;
          return (
            <div className="bg-[#0a0a0a] border border-[#E8B4B8]/30 p-8 rounded-[2rem] text-center shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <Flame className="w-14 h-14 mb-4" style={{ color: '#E8B4B8' }} />
                <h3 className="text-2xl font-medium uppercase tracking-tight mb-2" style={{ color: '#ffffff' }}>Conteúdo Exclusivo Elite 🔥</h3>
                <p className="text-sm font-medium mb-2" style={{ color: '#d4d4d4' }}>
                  Os <strong style={{ color: '#E8B4B8' }}>Textos com Jindungo</strong> são reservados para membros <strong style={{ color: '#E8B4B8' }}>Elite</strong>.
                </p>

                {eliteRequestStatus === 'pending' ? (
                  <>
                    <p className="text-xs font-medium mb-6 mt-2" style={{ color: '#a3a3a3' }}>
                      O teu pedido de acesso Elite já foi enviado e está a aguardar aprovação do administrador. ⏳
                    </p>
                    <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 px-6 py-3 rounded-2xl mb-4">
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="font-medium text-xs uppercase tracking-wide text-amber-400">Pedido Pendente — Aguarda Aprovação</span>
                    </div>
                    <button
                      onClick={handleCancelEliteRequest}
                      className="inline-flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 font-medium text-[11px] uppercase tracking-wide px-6 py-3 rounded-2xl transition-all active:scale-95"
                    >
                      Cancelar Pedido
                    </button>
                  </>
                ) : eliteRequestStatus === 'rejected' ? (
                  <>
                    <p className="text-xs font-medium mb-6 mt-2" style={{ color: '#f87171' }}>
                      O teu pedido foi rejeitado. Vai ao teu Perfil para ver o motivo e tentar novamente.
                    </p>
                    <Link
                      to="/app/profile"
                      className="inline-flex items-center gap-2 bg-white font-medium text-[11px] uppercase tracking-wide px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                      style={{ color: '#3A0310' }}
                    >
                      <Flame className="w-4 h-4" style={{ color: '#3A0310' }} />
                      Ver Motivo no Perfil
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium mb-8 mt-2" style={{ color: '#a3a3a3' }}>
                      Solicita o teu acesso Elite no teu Perfil e aguarda a aprovação do administrador.
                    </p>
                    <Link
                      to="/app/profile"
                      className="inline-flex items-center gap-2 bg-white font-medium text-[11px] uppercase tracking-wide px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                      style={{ color: '#3A0310' }}
                    >
                      <Flame className="w-4 h-4" style={{ color: '#3A0310' }} />
                      Solicitar Acesso Elite no Meu Perfil
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[#3A0310] dark:text-[#E8B4B8] animate-spin" />
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">A carregar conteúdos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Compass className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400 text-center">
              {search ? "Nenhum resultado para a sua pesquisa." : "Nenhum conteúdo disponível ainda."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((content, idx) => (
                <motion.div
                  key={content.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.04, ease: "easeOut" }}
                >
                  <Link
                    to={`/app/explore/${content.id}`}
                    onClick={(e) => {
                      if (content.type === 'jindungo') {
                        const userStr = localStorage.getItem('user');
                        if (!userStr) {
                          e.preventDefault();
                          toast.error('Acesso Restrito', { description: 'Faça login para ter acesso ao conteúdo jindungo.' });
                          navigate('/app/explore?filter=jindungo');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } else {
                          const user = JSON.parse(userStr);
                          if (user.role !== 'elite' && user.role !== 'admin') {
                            e.preventDefault();
                            toast.error('Acesso Bloqueado', { description: 'Você precisa ser membro elite para ler este conteúdo.' });
                            navigate('/app/explore?filter=jindungo');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }
                      }
                    }}
                    className="block bg-white dark:bg-white/5 rounded-3xl md:rounded-[2rem] border-2 border-white/10 dark:border-[#E8B4B8]/40 overflow-hidden hover:border-[#5A051A] dark:hover:border-[#E8B4B8]/80 hover:shadow-[0_20px_50px_rgba(58,3,16,0.12)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 group shadow-md flex flex-col h-full"
                  >
                    <div className="relative h-40 md:h-48 w-full overflow-hidden shrink-0">
                      {content.thumbnail ? (
                        <>
                          <div className="absolute inset-0">
                            <ImageWithFallback src={content.thumbnail} alt="" className="w-full h-full object-cover opacity-40 blur-md scale-110" />
                          </div>
                          <ImageWithFallback
                            src={content.thumbnail}
                            alt={content.title}
                            className="relative z-10 w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105 drop-shadow-xl"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-[#0a0a0a]/5 dark:bg-[#0a0a0a]/20 flex items-center justify-center">
                          <Compass className="w-8 h-8 text-[#3A0310]/30 dark:text-[#E8B4B8]/30" />
                        </div>
                      )}
                      <div className="absolute z-20 inset-0 bg-gradient-to-t from-neutral-900/80 dark:from-[#0F0F0F]/80 via-transparent to-transparent" />

                      {/* Save Button */}
                      <div className="absolute top-3 right-3 z-30">
                        <button
                          onClick={(e) => toggleSave(e, content)}
                          className={`p-2 rounded-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 border ${
                            savedContents.some(c => c.id === content.id)
                              ? 'bg-[#0a0a0a]/80 force-white shadow-md border-white/10/50'
                              : 'bg-black/50 force-white border-white/30 hover:bg-black/70'
                          }`}
                          title={savedContents.some(c => c.id === content.id) ? "Remover dos guardados" : "Guardar para mais tarde"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 md:w-4 md:h-4 ${savedContents.some(c => c.id === content.id) ? 'fill-current force-gold' : 'force-white'}`} />
                        </button>
                      </div>

                    </div>

                    <div className="p-4 md:p-6 flex flex-col justify-between grow">
                      <div>
                        <div className="flex items-center gap-2 mb-2 md:mb-2.5 flex-wrap">
                          <h3 className="font-medium text-neutral-800 dark:text-white text-base md:text-lg group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                            {content.title}
                          </h3>
                          <span className="shrink-0 flex items-center gap-1 bg-[#0a0a0a]/10 dark:bg-[#E8B4B8]/10 text-[#3A0310] dark:text-[#E8B4B8] text-[9px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded-md border border-white/10 dark:border-[#E8B4B8]">
                            {typeIcon(content.type)}{typeLabel(content.type)}
                          </span>
                        </div>
                        <p className="text-neutral-900 dark:text-white text-xs line-clamp-2 leading-relaxed font-medium">
                          {content.description}
                        </p>
                      </div>

                      <div className="mt-3 md:mt-6 flex items-center justify-between border-t border-neutral-100 dark:border-white/5 pt-2 md:pt-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          {(() => {
                            const stats = getContentStats(content);
                            return (
                              <>
                                <span className="flex items-center gap-0.5 md:gap-1 text-[6px] md:text-[9px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                                  <ThumbsUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-500" />
                                  {stats.likes}
                                </span>
                                <span className="flex items-center gap-0.5 md:gap-1 text-[6px] md:text-[9px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                                  <ThumbsDown className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-500" />
                                  {stats.dislikes}
                                </span>
                                <span className="flex items-center gap-0.5 md:gap-1 text-[6px] md:text-[9px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                                  <MessageSquare className="w-2.5 h-2.5 md:w-3 md:h-3 text-neutral-400 dark:text-neutral-500" />
                                  Disc. {stats.comments}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex items-center text-[#3A0310] dark:text-[#E8B4B8] font-medium text-[6px] md:text-[9px] uppercase tracking-wide gap-0.5 md:gap-1 group-hover:gap-1.5 md:group-hover:gap-2.5 transition-all whitespace-nowrap">
                          Aceder <ArrowLeft className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 rotate-180" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePreview() {
  return (
    <MemoryRouter>
      <Explore />
    </MemoryRouter>
  );
}
