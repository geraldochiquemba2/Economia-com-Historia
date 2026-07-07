import React, { useState, useEffect } from "react";
import { useParams, Link, MemoryRouter, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, PlayCircle, Bookmark, Share2, CheckCircle2, Clock, Eye, Loader2, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CommentSection } from "../components/CommentSection";
import { audioPlay } from "../components/audioStore";

type ContentItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail: string;
  fullText?: string;
  videoUrl?: string;
  authorName?: string;
  createdAt?: string;
};

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [savedContents, setSavedContents] = useState<any[]>([]);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.id) {
        fetch(`/api/users/${user.id}/saved`)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data)) setSavedContents(data);
            else setSavedContents([]);
          })
          .catch(() => setSavedContents([]));
      } else {
        setSavedContents([]);
      }
    } catch {
      setSavedContents([]);
    }
  }, []);

  const isSaved = content && savedContents.some(c => c.id === content.id);

  const toggleSave = () => {
    if (!content) return;
    
    const user = localStorage.getItem("user");
    if (!user) {
      navigate('/register');
      return;
    }
    
    const parsedUser = JSON.parse(user);
    const userId = parsedUser.id;

    if (isSaved) {
      setSavedContents(savedContents.filter(c => c.id !== content.id));
      fetch(`/api/users/${userId}/saved/${content.id}`, { method: 'DELETE' }).catch(console.error);
    } else {
      setSavedContents([...savedContents, content]);
      fetch(`/api/users/${userId}/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: content.id })
      }).catch(console.error);
    }
  };
  const [showVideo, setShowVideo] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [showLikers, setShowLikers] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}
  }, []);

  useEffect(() => {
    if (!currentUser?.id || !content?.id) return;
    fetch(`/api/users/${currentUser.id}/completed`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.some((s: any) => s.contentId === content.id)) {
          setIsCompleted(true);
        }
      })
      .catch(console.error);
  }, [currentUser?.id, content?.id]);

  useEffect(() => {
    if (content) {
      const likes = content.likes || [];
      const dislikes = content.dislikes || [];
      setLikesCount(likes.length);
      setDislikesCount(dislikes.length);

      if (currentUser?.id) {
        if (likes.includes(currentUser.id)) setReaction('like');
        else if (dislikes.includes(currentUser.id)) setReaction('dislike');
        else setReaction(null);
      } else {
        setReaction(null);
      }
    }
  }, [content, currentUser?.id]);

  const handleReaction = async (type: 'like' | 'dislike') => {
    const token = localStorage.getItem("token");
    if (!token || !currentUser) {
      navigate('/register');
      return;
    }
    
    if (!content) return;
    const newReaction = reaction === type ? null : type;
    
    if (reaction === 'like' && newReaction !== 'like') setLikesCount(c => c - 1);
    if (reaction === 'dislike' && newReaction !== 'dislike') setDislikesCount(c => c - 1);
    
    if (newReaction === 'like') setLikesCount(c => c + 1);
    if (newReaction === 'dislike') setDislikesCount(c => c + 1);

    setReaction(newReaction);
    
    try {
      await fetch(`/api/content/${content.id}/react`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      console.error("Erro ao reagir:", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/content/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        if (data.type === 'jindungo') {
          const userStr = localStorage.getItem('user');
          if (!userStr) {
            toast.error('Acesso Restrito', { description: 'Faça login para ter acesso ao conteúdo jindungo.' });
            navigate('/app/explore?filter=jindungo');
            return;
          }
          const user = JSON.parse(userStr);
          if (!['elite', 'admin', 'escritor', 'revisor'].includes(user.role)) {
            toast.error('Acesso Bloqueado', { description: 'Você precisa ser membro elite para ler este conteúdo.' });
            navigate('/app/explore?filter=jindungo');
            return;
          }
        }
        setContent(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-6 min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0F0F0F]">
        <Loader2 className="w-8 h-8 text-[#E8B4B8] animate-spin" />
        <p className="text-white text-xs font-black uppercase tracking-widest">A carregar conteúdo...</p>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="p-6 min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0F0F0F]">
        <AlertCircle className="w-10 h-10 text-[#E8B4B8]" />
        <p className="text-white text-sm font-black uppercase tracking-widest">Conteúdo não encontrado.</p>
        <Link to="/app/explore" className="text-[#E8B4B8] text-xs font-black uppercase tracking-widest underline underline-offset-4">
          Voltar ao Explorar
        </Link>
      </div>
    );
  }

  const ytId = content.videoUrl ? getYouTubeId(content.videoUrl) : null;

  // Split fullText into paragraphs if it's a long string
  const paragraphs = content.fullText
    ? content.fullText.split(/\n+/).filter(p => p.trim().length > 0)
    : [];

  return (
    <div className="bg-[#FDFBFB] dark:bg-[#0F0F0F] min-h-screen pb-24 text-neutral-800 dark:text-neutral-100 transition-all duration-300">

      {/* Header Nav */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 w-full max-w-5xl mx-auto z-[60] p-4 flex items-center justify-between bg-[#FDFBFB] dark:bg-[#0F0F0F] border-b border-neutral-100 dark:border-white/5"
      >
        <Link to="/app/explore" className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/10 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={toggleSave}
            title={isSaved ? "Remover dos guardados" : "Guardar para mais tarde"}
            className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white hover:bg-[#3A0310]/5 dark:hover:bg-white/10 transition-all shadow-sm group"
          >
            <Bookmark className={`w-4 h-4 transition-colors ${isSaved ? 'fill-[#3A0310] text-[#3A0310] dark:fill-[#E8B4B8] dark:text-[#E8B4B8]' : 'group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8]'}`} />
          </button>
          <button className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/10 transition-all shadow-sm">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Hero / Video Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full overflow-hidden bg-black flex justify-center"
      >
        {/* Video embed or thumbnail */}
        {content.type === "video" && content.videoUrl && showVideo ? (
          <div className="relative w-full max-w-5xl aspect-video bg-black">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : (
              <video
                src={content.videoUrl}
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
          </div>
        ) : (
          <div className="relative w-full h-[50vh]">
            {content.thumbnail ? (
              <>
                <div className="absolute inset-0">
                  <img src={content.thumbnail} alt="" className="w-full h-full object-cover opacity-50 blur-lg scale-110" />
                </div>
                <ImageWithFallback
                  src={content.thumbnail}
                  alt={content.title}
                  className="relative z-10 w-full h-full object-contain"
                />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#3A0310] to-black" />
            )}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Play button overlay for videos */}
            {content.type === "video" && content.videoUrl && (
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowVideo(true)}
                  className="w-20 h-20 bg-[#3A0310]/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-[#E8B4B8]/30 shadow-2xl group"
                >
                  <PlayCircle className="w-10 h-10 group-hover:text-[#E8B4B8] transition-colors" style={{ color: '#ffffff' }} />
                </motion.button>
              </div>
            )}

            {/* Play button overlay for audio/podcast */}
            {content.type === "podcast" && content.videoUrl && (
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => audioPlay(content.videoUrl!, content.title, content.thumbnail || "")}
                  className="w-20 h-20 bg-[#3A0310]/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-[#E8B4B8]/30 shadow-2xl group"
                >
                  <PlayCircle className="w-10 h-10 group-hover:text-[#E8B4B8] transition-colors" style={{ color: '#ffffff' }} />
                </motion.button>
              </div>
            )}

            {/* Title overlay */}
            <div className="absolute bottom-10 left-0 right-0 px-6 z-30">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#3A0310] px-3 py-1 rounded-full uppercase tracking-widest border border-[#E8B4B8]/20 text-[10px] font-black" style={{ color: '#E8B4B8' }}>
                  {({ jindungo: "Texto com Jindungo 🔥", text: "Texto", video: "Vídeo", podcast: "Áudio" }[content.type] || content.type)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-none uppercase tracking-tighter drop-shadow-2xl" style={{ color: '#ffffff' }}>
                {content.title}
              </h1>
              {(content.authorName || content.createdAt) && (
                <p className="text-white/70 text-xs font-medium mt-2">
                  {content.authorName && `por ${content.authorName}`}
                  {content.authorName && content.createdAt && ' · '}
                  {content.createdAt && new Date(content.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 space-y-8 mt-6 relative z-10">
        {showVideo && (
          <h1 className="text-2xl md:text-4xl font-black leading-none uppercase tracking-tighter text-neutral-900 dark:text-white mt-4">
            {content.title}
          </h1>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-neutral-500 dark:text-neutral-400 text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" /> Leitura</span>
          </div>

          <div className="relative flex items-center gap-2">
            <button 
              onClick={() => handleReaction('like')}
              title="Gosto"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${reaction === 'like' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10 border border-transparent'}`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${reaction === 'like' ? 'fill-blue-500' : ''}`} />
              Gostei <span className="ml-0.5 opacity-70">({likesCount})</span>
            </button>
            <button 
              onClick={() => handleReaction('dislike')}
              title="Não Gosto"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${reaction === 'dislike' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10 border border-transparent'}`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${reaction === 'dislike' ? 'fill-red-500' : ''}`} />
              Não Gostei <span className="ml-0.5 opacity-70">({dislikesCount})</span>
            </button>

            <div className="relative ml-2">
              <button 
                onClick={() => setShowLikers(!showLikers)}
                className="text-[9px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors underline underline-offset-4"
              >
                Quem gostou?
              </button>

              <AnimatePresence>
                {showLikers && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-white/5">
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Pessoas que gostaram</h4>
                    </div>
                    <div className="max-h-48 overflow-y-auto p-2">
                      {reaction === 'like' ? (
                        <div className="flex items-center gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-default">
                          {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Você" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-[10px] uppercase">
                              {currentUser?.name ? currentUser.name[0] : 'V'}
                            </div>
                          )}
                          <span className="text-xs font-bold text-neutral-800 dark:text-white">Você</span>
                        </div>
                      ) : (
                        <div className="p-3 text-center text-xs text-neutral-500 italic">
                          Ainda ninguém gostou.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          {content.description && (
            <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed italic mb-8 border-l-4 border-[#3A0310] pl-4 md:pl-6">
              {content.description}
            </p>
          )}

          <div className="space-y-6 text-neutral-800 dark:text-neutral-300 leading-relaxed font-medium">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p className="text-neutral-400 dark:text-neutral-500 italic text-sm">Sem conteúdo adicional disponível.</p>
            )}
          </div>
          

        </motion.div>

        {/* Complete Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-10 flex flex-col items-center"
        >
          {(() => {
            const userStr = localStorage.getItem('user');
            const isLoggedIn = !!userStr;

            if (isLoggedIn) {
              return (
                <>
                  <button
                    onClick={() => {
                      if (isCompleted) return;
                      const user = JSON.parse(userStr!);
                      fetch(`/api/users/${user.id}/completed`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contentId: id })
                      }).then(() => setIsCompleted(true)).catch(console.error);
                      toast.success("Jornada concluída! +50 Pontos de Prestígio");
                    }}
                    disabled={isCompleted}
                    className={`w-full py-5 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      isCompleted 
                        ? 'bg-green-700/90 dark:bg-green-600/80 force-white cursor-default shadow-lg border border-green-500/30' 
                        : 'bg-[#3A0310] force-white shadow-[0_15px_35px_rgba(58,3,16,0.4)] hover:bg-[#5A051A] active:scale-[0.98] group border border-[#E8B4B8]/20'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 text-white force-white ${!isCompleted ? 'group-hover:scale-110 transition-transform' : ''}`} />
                    {isCompleted ? "Estudo Concluído" : "Concluir Estudo"}
                  </button>
                  {!isCompleted && (
                    <p className="mt-4 text-[9px] text-neutral-500 dark:text-white font-black uppercase tracking-[0.2em]">Clica para gravar este conhecimento</p>
                  )}
                </>
              );
            }

            return (
              <>
                <button
                  onClick={() => {
                    toast.error("Precisa de estar registado para concluir estudos!");
                    setTimeout(() => navigate("/"), 1200);
                  }}
                  className="w-full py-5 bg-neutral-200 dark:bg-white/5 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-dashed border-neutral-300 dark:border-white/10 cursor-not-allowed opacity-60 transition-all"
                  style={{ color: '#888' }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Concluir Estudo
                </button>
                <p className="mt-4 text-[9px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-[0.2em] text-center">
                  🔒 Apenas membros registados podem gravar o seu progresso —{" "}
                  <button
                    onClick={() => navigate("/")}
                    className="underline underline-offset-2 text-[#3A0310] dark:text-[#E8B4B8] hover:opacity-70 transition-opacity"
                  >
                    Entrar / Registar
                  </button>
                </p>
              </>
            );
          })()}
        </motion.div>

        <CommentSection contentId={id} title="Discussões" placeholder="Contribuir para o debate..." />
      </div>
    </div>
  );
}

export default function ContentDetailPreview() {
  return (
    <MemoryRouter>
      <ContentDetail />
    </MemoryRouter>
  );
}
