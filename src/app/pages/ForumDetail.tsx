import React, { useState } from "react";
import { useParams, Link, MemoryRouter } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MessageSquare, Heart, Share2, MoreVertical, Send, ShieldCheck, User } from "lucide-react";
import { forumTopics } from "../data/mockData";

export function ForumDetail() {
  const { id } = useParams();
  const topic = forumTopics.find((t) => t.id === id) || forumTopics[0];
  
  const [newComment, setNewComment] = useState("");
  const [topicLiked, setTopicLiked] = useState(false);
  const [topicLikes, setTopicLikes] = useState(24);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [comments, setComments] = useState([
    { 
      id: 1, 
      author: "Miguel Sousa", 
      time: "Há 2 horas", 
      text: "Excelente ponto! Acredito que a diversificação económica é o único caminho sustentável a longo prazo.", 
      likes: 12, 
      liked: false,
      replies: [] as any[]
    },
    { 
      id: 2, 
      author: "Sofia Marques", 
      time: "Há 4 horas", 
      text: "Não concordo totalmente. A infraestrutura base ainda precisa de muito investimento antes de pensarmos em diversificar de forma agressiva.", 
      likes: 5, 
      liked: false,
      replies: [
        { id: 101, author: "João Pedro", time: "Há 3 horas", text: "Concordo com a Sofia. Sem estradas e energia estável, a diversificação é um mito.", likes: 2, liked: false }
      ]
    }
  ]);

  const toggleTopicLike = () => {
    if (topicLiked) {
      setTopicLikes(prev => prev - 1);
    } else {
      setTopicLikes(prev => prev + 1);
    }
    setTopicLiked(!topicLiked);
  };

  const toggleCommentLike = (id: number) => {
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
      }
      if (c.replies && c.replies.length > 0) {
        return {
          ...c,
          replies: c.replies.map((r: any) => {
            if (r.id === id) {
              return { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 };
            }
            return r;
          })
        };
      }
      return c;
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: Date.now(),
      author: "Marcos Silva",
      time: "Agora mesmo",
      text: newComment,
      likes: 0,
      liked: false,
      replies: []
    };

    if (replyingTo) {
      setComments(prev => prev.map(c => {
        if (c.id === replyingTo.id) {
          return { ...c, replies: [...(c.replies || []), newCommentObj] };
        }
        if (c.replies && c.replies.some((r: any) => r.id === replyingTo.id)) {
          return { ...c, replies: [...(c.replies || []), { ...newCommentObj, text: `@${replyingTo.author} ${newComment}` }] };
        }
        return c;
      }));
    } else {
      setComments([newCommentObj, ...comments]);
    }
    
    setNewComment("");
    setReplyingTo(null);
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen pb-40 text-neutral-100 overflow-x-hidden">
      {/* Sticky Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-[#0F0F0F]/80 backdrop-blur-xl p-6 flex items-center justify-between border-b border-white/5 shadow-2xl"
      >
        <Link to="/app/forum" className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-neutral-400 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <h2 className="font-black text-white text-xs uppercase tracking-[0.2em]">Círculo de Debate</h2>
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1 font-bold">Arquivos do Prestígio</p>
        </div>
        <button className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-neutral-400">
          <MoreVertical className="w-5 h-5" />
        </button>
      </motion.header>

      <main className="p-6 space-y-8">
        {/* Main Topic Card */}
        <motion.article
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#3A0310]"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center text-lg font-black text-[#E8B4B8] border border-white/10">
              {topic.author.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white leading-none mb-1">{topic.author}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[#E8B4B8] font-black uppercase tracking-widest">Académico Sênior</span>
                <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{topic.date}</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
            {topic.title}
          </h1>
          
          <div className="prose prose-invert prose-sm text-neutral-400 leading-relaxed font-medium mb-8">
            <p className="italic border-l-2 border-[#3A0310] pl-4">
              "Olá a todos! Tenho acompanhado os últimos desenvolvimentos económicos e gostava de abrir uma discussão sobre este tema. 
              Quais são as vossas perspetivas sobre o impacto que as recentes políticas terão a médio e longo prazo?"
            </p>
            <p className="mt-4">
              Gostaria de focar a nossa análise não apenas nos grandes centros urbanos, mas também nas províncias que dependem
              maioritariamente do comércio transfronteiriço.
            </p>
          </div>
          
          <div className="flex items-center gap-6 pt-6 border-t border-white/5">
            <button 
              onClick={toggleTopicLike}
              className={`flex items-center gap-2 group transition-all ${
                topicLiked ? "text-[#E8B4B8]" : "text-neutral-500 hover:text-white"
              }`}
            >
              <Heart className={`w-5 h-5 transition-all ${topicLiked ? "fill-[#3A0310] stroke-[#E8B4B8]" : ""}`} />
              <span className="text-xs font-black uppercase tracking-widest">{topicLikes}</span>
            </button>
            <div className="flex items-center gap-2 text-neutral-500">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{comments.length}</span>
            </div>
            <button className="ml-auto text-neutral-500 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </motion.article>

        {/* Comments Section */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3A0310]" /> Contribuições de Elite
          </h3>
          
          <div className="space-y-4">
            <AnimatePresence>
              {comments.map((comment, index) => (
                <div key={comment.id} className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all shadow-xl group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center font-black text-[10px] text-neutral-400 border border-white/5 uppercase group-hover:bg-[#3A0310]/20 transition-all">
                          {comment.author.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block leading-none mb-1">{comment.author}</span>
                          <span className="text-[9px] text-neutral-500 font-black tracking-widest uppercase">{comment.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed font-medium mb-4 italic">
                      "{comment.text}"
                    </p>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => toggleCommentLike(comment.id)}
                        className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                          comment.liked ? "text-[#E8B4B8]" : "text-neutral-500 hover:text-white"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${comment.liked ? "fill-[#3A0310] stroke-[#E8B4B8]" : ""}`} /> {comment.likes}
                      </button>
                      <button 
                        onClick={() => {
                          setReplyingTo(comment);
                          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }}
                        className="text-[9px] text-[#3A0310] font-black uppercase tracking-widest hover:text-[#E8B4B8] transition-colors"
                      >
                        Responder
                      </button>
                    </div>
                  </motion.div>

                  {/* Render Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-10 space-y-4 border-l border-[#3A0310]/30 pl-6">
                      {comment.replies.map((reply: any) => (
                        <motion.div
                          key={reply.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white/[0.03] p-4 rounded-[1.5rem] border border-white/5"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-white/5 rounded-lg flex items-center justify-center font-black text-[8px] text-neutral-500 border border-white/5 uppercase">
                              {reply.author.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-white text-[10px] block leading-none mb-0.5">{reply.author}</span>
                              <span className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">{reply.time}</span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                            {reply.text}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Floating Input Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-48px)] z-[60]"
      >
        <AnimatePresence>
          {replyingTo && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-[#3A0310] px-4 py-2 rounded-t-2xl flex items-center justify-between border-x border-t border-[#E8B4B8]/20"
            >
              <span className="text-[8px] font-black text-[#E8B4B8] uppercase tracking-[0.2em]">
                Repondo a <span className="text-white">{replyingTo.author}</span>
              </span>
              <button onClick={() => setReplyingTo(null)} className="text-white/50 hover:text-white text-[10px] font-black">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        <form 
          onSubmit={handleAddComment} 
          className="bg-black/60 backdrop-blur-3xl p-3 rounded-[2rem] border border-white/10 flex items-center gap-3 shadow-2xl"
        >
          <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 flex-shrink-0">
             <User className="w-5 h-5 text-neutral-600" />
          </div>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? "Sua resposta..." : "Adicionar pensamento..."}
            className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder-neutral-500 force-white force-white-placeholder"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="w-10 h-10 bg-[#3A0310] text-[#E8B4B8] rounded-2xl flex items-center justify-center shadow-xl hover:bg-[#5A051A] transition-all disabled:opacity-50 border border-[#E8B4B8]/20 flex-shrink-0"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ForumDetailPreview() {
  return (
    <MemoryRouter initialEntries={["/app/forum/t1"]}>
      <ForumDetail />
    </MemoryRouter>
  );
}
