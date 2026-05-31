import React, { useState } from "react";
import { useParams, Link, MemoryRouter, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, PlayCircle, Heart, Share2, MessageCircle, CheckCircle2, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { exploreContents } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const content = exploreContents.find((c) => c.id === id);

  const [newComment, setNewComment] = useState("");
  const [commentsList, setCommentsList] = useState([
    { id: 1, author: "João Pedro", time: "Há 2 horas", text: "Muito interessante! Não tinha ideia da magnitude dessa reforma." },
    { id: 2, author: "Alice Fernando", time: "Há 5 horas", text: "Gostaria de ver mais conteúdos sobre o papel da mulher nesse contexto." }
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setCommentsList([
      ...commentsList,
      {
        id: Date.now(),
        author: "Marcos Silva",
        time: "Agora mesmo",
        text: newComment
      }
    ]);
    setNewComment("");
  };

  if (!content) {
    return <div className="p-6 bg-[#0F0F0F] min-h-screen text-white flex items-center justify-center">Conteúdo não encontrado.</div>;
  }

  return (
    <div className="bg-[#FDFBFB] dark:bg-[#0F0F0F] min-h-screen pb-24 text-neutral-800 dark:text-neutral-100 transition-all duration-300">
      {/* Header Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-5xl z-[60] p-6 flex items-center justify-between"
      >
        <Link to="/app/explore" className="w-12 h-12 bg-black/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-white hover:bg-black/40 transition-all shadow-2xl">
          <ArrowLeft className="w-6 h-6" style={{ color: '#ffffff' }} />
        </Link>
        <div className="flex gap-3">
          <button className="w-12 h-12 bg-black/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-white hover:bg-[#3A0310]/40 transition-all shadow-2xl group">
            <Heart className="w-5 h-5 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" style={{ color: '#ffffff' }} />
          </button>
          <button className="w-12 h-12 bg-black/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-white hover:bg-black/40 transition-all shadow-2xl">
            <Share2 className="w-5 h-5" style={{ color: '#ffffff' }} />
          </button>
        </div>
      </motion.div>
 
      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative w-full h-[50vh] overflow-hidden"
      >
        <ImageWithFallback
          src={content.thumbnail}
          alt={content.title}
          className="w-full h-full object-cover grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {content.type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl cursor-pointer group"
            >
              <PlayCircle className="w-10 h-10 text-white group-hover:text-[#E8B4B8] transition-colors" style={{ color: '#ffffff' }} />
            </motion.div>
          </div>
        )}
 
        <div className="absolute bottom-10 left-0 right-0 px-6 z-20">
          <div className="flex items-center gap-2 mb-4">
             <span 
               className="bg-[#3A0310] px-3 py-1 rounded-full uppercase tracking-widest border border-[#E8B4B8]/20 text-[10px] font-black"
               style={{ color: '#E8B4B8' }}
             >
              {content.type}
            </span>
            <span 
              className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 uppercase tracking-widest text-[10px] font-bold"
              style={{ color: '#ffffff' }}
            >
              Nível 3
            </span>
          </div>
          <h1 
            className="text-4xl font-black leading-none uppercase tracking-tighter drop-shadow-2xl"
            style={{ color: '#ffffff' }}
          >
            {content.title}
          </h1>
        </div>
      </motion.div>

      <div className="px-6 space-y-8 -mt-4 relative z-10">
        <div className="flex items-center gap-6 text-neutral-900 dark:text-white text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" /> 12 MIN DE LEITURA</span>
          <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" /> 1.2K VISTAS</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none"
        >
          <p className="text-xl text-neutral-900 dark:text-neutral-300 font-medium leading-relaxed italic mb-8 border-l-4 border-[#3A0310] pl-6">
            {content.description}
          </p>
          <div className="space-y-6 text-neutral-900 dark:text-neutral-400 leading-relaxed font-medium">
            {content.fullText && content.fullText.length > 0 ? (
              content.fullText.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <>
                <p>
                  Este conteúdo detalha as nuances históricas e os impactos diretos na sociedade angolana. 
                  É crucial entender como o período analisado moldou as relações comerciais e de produção.
                </p>
                <p>
                  Os dados indicam que as mudanças estruturais não aconteceram de forma isolada, mas sim como 
                  uma resposta direta às pressões externas e à reorganização do poder local.
                </p>
                <p>
                  Exploramos aqui o conceito de prestígio económico através das rotas comerciais antigas, onde o valor não era apenas medido em ouro, mas na influência cultural exercida sobre as regiões vizinhas.
                </p>
              </>
            )}
          </div>
        </motion.div>
        
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
            className="w-full py-5 bg-[#3A0310] text-white rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(58,3,16,0.4)] hover:bg-[#5A051A] transition-all active:scale-[0.98] group border border-[#E8B4B8]/20"
            style={{ color: '#ffffff' }}
          >
            <CheckCircle2 className="w-5 h-5 text-[#E8B4B8] group-hover:scale-110 transition-transform" />
            Concluir Estudo
          </button>
          <p className="mt-4 text-[9px] text-neutral-900 dark:text-white font-black uppercase tracking-[0.2em]">Clica para gravar este conhecimento</p>
        </motion.div>

        {/* Comments Section */}
        <section className="pt-12 border-t border-[#3A0310]/10 dark:border-white/5 pb-10">
          <h3 className="text-xl font-black text-neutral-800 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
            <MessageCircle className="w-6 h-6 text-[#3A0310] dark:text-[#E8B4B8]" />
            Discussão de Elite ({commentsList.length})
          </h3>
          
          <div className="space-y-4 mb-10">
            <AnimatePresence>
              {commentsList.map(comment => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-[#3A0310]/25 dark:border-white/5 hover:border-[#3A0310]/60 transition-all relative overflow-hidden shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center text-[10px] font-black text-[#E8B4B8] border border-white/10 uppercase" style={{ color: '#E8B4B8' }}>
                        {comment.author.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-neutral-800 dark:text-white text-xs block leading-none mb-1">{comment.author}</span>
                        <span className="text-[9px] text-neutral-900 dark:text-neutral-300 font-black uppercase tracking-widest">Académico</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-neutral-900 dark:text-neutral-300 uppercase tracking-widest">{comment.time}</span>
                  </div>
                  <p className="text-sm text-neutral-900 dark:text-neutral-200 font-medium leading-relaxed italic">"{comment.text}"</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Floating Comment Bar */}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-48px)] md:max-w-xl z-[60] transition-all duration-300">
        <form 
          onSubmit={handleAddComment} 
          className="bg-black/80 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/15 flex gap-2 shadow-2xl"
        >
          <input 
            type="text" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Contribuir para o debate..." 
            className="flex-1 bg-transparent border-none rounded-full px-5 py-3 text-sm focus:outline-none placeholder-neutral-500 force-white force-white-placeholder" 
            style={{ color: '#ffffff' }}
          />
          <button 
            type="submit"
            disabled={!newComment.trim()}
            className="bg-[#3A0310] px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#5A051A] transition-all disabled:opacity-50 border border-[#E8B4B8]/20 force-white"
            style={{ color: '#ffffff' }}
          >
            Enviar
          </button>
        </form>
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
