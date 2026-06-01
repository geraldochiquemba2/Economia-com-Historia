import React, { useState, useEffect } from "react";
import { useParams, Link, MemoryRouter, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, PlayCircle, Heart, Share2, CheckCircle2, Clock, Eye, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CommentSection } from "../components/CommentSection";

type ContentItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail: string;
  fullText?: string;
  videoUrl?: string;
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
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/content/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => setContent(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

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
          <button className="w-10 h-10 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white hover:bg-[#3A0310]/5 transition-all shadow-sm group">
            <Heart className="w-4 h-4 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
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
        className="relative w-full overflow-hidden"
        style={{ minHeight: '50vh' }}
      >
        {/* Video embed or thumbnail */}
        {content.type === "video" && content.videoUrl && showVideo ? (
          <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
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

            {/* Title overlay */}
            <div className="absolute bottom-10 left-0 right-0 px-6 z-30">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#3A0310] px-3 py-1 rounded-full uppercase tracking-widest border border-[#E8B4B8]/20 text-[10px] font-black" style={{ color: '#E8B4B8' }}>
                  {content.type}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black leading-none uppercase tracking-tighter drop-shadow-2xl" style={{ color: '#ffffff' }}>
                {content.title}
              </h1>
            </div>
          </div>
        )}
      </motion.div>

      <div className="px-6 space-y-8 mt-6 relative z-10">
        <div className="flex items-center gap-6 text-neutral-500 dark:text-neutral-400 text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" /> Leitura</span>
          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" /> Nível 3</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          {content.description && (
            <p className="text-xl text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed italic mb-8 border-l-4 border-[#3A0310] pl-6">
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
          <button
            onClick={() => {
              toast.success("Jornada concluída! +50 Pontos de Prestígio");
              setTimeout(() => navigate("/app/explore"), 1500);
            }}
            className="w-full py-5 bg-[#3A0310] rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(58,3,16,0.4)] hover:bg-[#5A051A] transition-all active:scale-[0.98] group border border-[#E8B4B8]/20"
            style={{ color: '#ffffff' }}
          >
            <CheckCircle2 className="w-5 h-5 text-[#E8B4B8] group-hover:scale-110 transition-transform" />
            Concluir Estudo
          </button>
          <p className="mt-4 text-[9px] text-neutral-500 dark:text-white font-black uppercase tracking-[0.2em]">Clica para gravar este conhecimento</p>
        </motion.div>

        <CommentSection title="Discussão de Elite" placeholder="Contribuir para o debate..." />
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
