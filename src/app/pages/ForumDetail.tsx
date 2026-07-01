import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, MemoryRouter, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Share2, MoreVertical, Bookmark, Share, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from "lucide-react";
import { CommentSection } from "../components/CommentSection";
import { toast } from "sonner";

export function ForumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [authorAvatar, setAuthorAvatar] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [showLikers, setShowLikers] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const token = localStorage.getItem('token');

  // Buscar tópico da API
  useEffect(() => {
    if (!id) return;
    const fetchTopic = async () => {
      try {
        const res = await fetch(`/api/content/${id}`);
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        setTopic(data);
        setLikesCount(data.likes?.length || 0);
        setDislikesCount(data.dislikes?.length || 0);
        if (currentUser?.id) {
          if (data.likes?.includes(currentUser.id)) setReaction('like');
          else if (data.dislikes?.includes(currentUser.id)) setReaction('dislike');
        }
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    };
    fetchTopic();
    const interval = setInterval(fetchTopic, 60000);
    return () => clearInterval(interval);
  }, [id]);

  // Verificar se está guardado na API
  useEffect(() => {
    if (!currentUser?.id || !id) return;
    fetch(`/api/users/${currentUser.id}/saved`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setIsSaved(data.some((s: any) => s.id === id));
        }
      })
      .catch(() => {});
  }, [id, currentUser?.id]);

  // Fetch author avatar
  useEffect(() => {
    if (!topic?.author) return;
    fetch(`/api/users/search?q=${encodeURIComponent(topic.author)}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0 && data[0].avatar) {
          setAuthorAvatar(data[0].avatar);
        }
      })
      .catch(() => {});
  }, [topic?.author]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!currentUser || !token) {
      toast.error('Ação não permitida', { description: 'Deve estar logado para reagir.' });
      return;
    }
    const newReaction = reaction === type ? null : type;
    if (reaction === 'like' && newReaction !== 'like') setLikesCount(c => c - 1);
    if (reaction === 'dislike' && newReaction !== 'dislike') setDislikesCount(c => c - 1);
    if (newReaction === 'like') setLikesCount(c => c + 1);
    if (newReaction === 'dislike') setDislikesCount(c => c + 1);
    setReaction(newReaction);

    try {
      await fetch(`/api/content/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ type })
      });
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Ação não permitida', { description: 'Deve estar logado para guardar.' });
      return;
    }
    if (isSaved) {
      setIsSaved(false);
      setSaveMsg('Removido dos favoritos');
      await fetch(`/api/users/${currentUser.id}/saved/${id}`, { method: 'DELETE' }).catch(console.error);
    } else {
      setIsSaved(true);
      setSaveMsg('Guardado nos favoritos!');
      await fetch(`/api/users/${currentUser.id}/saved`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: id })
      }).catch(console.error);
    }
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: topic?.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setSaveMsg('Link copiado!');
      setTimeout(() => setSaveMsg(''), 2500);
    }
    setMenuOpen(false);
  };

  function timeAgo(dateStr: string) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
    return `há ${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) === 1 ? '' : 's'}`;
  }

  if (loading) {
    return (
      <div className="bg-[#0F0F0F] min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#E8B4B8] animate-spin" />
        <p className="text-white text-xs font-black uppercase tracking-widest">A carregar debate...</p>
      </div>
    );
  }

  if (notFound || !topic) {
    return (
      <div className="bg-[#0F0F0F] min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-[#E8B4B8]" />
        <p className="text-white text-sm font-black uppercase tracking-widest">Debate não encontrado.</p>
        <Link to="/app/forum" className="text-[#E8B4B8] text-xs font-black uppercase tracking-widest underline underline-offset-4">
          Voltar ao Fórum
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0F0F] min-h-screen pb-40 text-neutral-100 overflow-x-hidden">
      {saveMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl" style={{background: 'linear-gradient(135deg,#3A0310,#5A051A)', color: 'white', border: '1px solid rgba(232,180,184,0.3)'}}>
          {saveMsg}
        </div>
      )}

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

        {/* Menu 3 dots */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-neutral-400 hover:text-white transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              className="absolute right-0 top-12 w-52 rounded-2xl shadow-2xl overflow-hidden z-[100]"
              style={{background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)'}}
            >
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5"
                style={{color: 'white'}}
              >
                <Share className="w-4 h-4" style={{color: 'white'}} />
                Partilhar
              </button>
            </motion.div>
          )}
        </div>
      </motion.header>

      <main className="p-4 md:p-6 space-y-8">
        {/* Main Topic Card */}
        <motion.article
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 rounded-[2.5rem] border border-white/10 p-5 md:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#3A0310]"></div>

          <div className="flex items-center gap-4 mb-8">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={topic.author}
                className="w-12 h-12 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center text-lg font-black border border-white/10" style={{color:'white'}}>
                {(topic.author || 'A').charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-white leading-none mb-1">{topic.author || 'Autor'}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[#E8B4B8] font-black uppercase tracking-widest">Académico</span>
                <span className="w-1 h-1 rounded-full bg-neutral-400"></span>
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{timeAgo(topic.createdAt)}</span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
            {topic.title}
          </h1>

          {topic.description && (
            <div className="prose prose-sm text-neutral-300 leading-relaxed font-medium mb-8">
              <p className="italic border-l-2 border-[#3A0310] pl-4">{topic.description}</p>
            </div>
          )}

          {topic.fullText && (
            <div className="prose prose-sm text-neutral-300 leading-relaxed font-medium mb-8">
              {topic.fullText.split(/\n+/).filter((p: string) => p.trim()).map((p: string, i: number) => (
                <p key={i} className="mt-4">{p}</p>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-6 border-t border-white/5">
            {/* Guardar */}
            <button
              onClick={handleSave}
              title={isSaved ? "Remover dos guardados" : "Guardar"}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all border ${isSaved ? 'bg-[#3A0310]/20 text-[#E8B4B8] border-[#3A0310]/30' : 'bg-white/5 text-neutral-400 hover:bg-white/10 border-transparent'}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#E8B4B8]' : ''}`} />
              {isSaved ? 'Guardado' : 'Guardar'}
            </button>

            {/* Gosto */}
            <button
              onClick={() => handleReaction('like')}
              title="Gosto"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all border ${reaction === 'like' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/5 text-neutral-400 hover:bg-white/10 border-transparent'}`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${reaction === 'like' ? 'fill-blue-400' : ''}`} />
              Gostei {likesCount > 0 && <span className="opacity-70">({likesCount})</span>}
            </button>

            {/* Desgosto */}
            <button
              onClick={() => handleReaction('dislike')}
              title="Não Gosto"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[9px] uppercase tracking-widest transition-all border ${reaction === 'dislike' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-neutral-400 hover:bg-white/10 border-transparent'}`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${reaction === 'dislike' ? 'fill-red-400' : ''}`} />
              Não Gostei <span className="opacity-70">({dislikesCount})</span>
            </button>

            <button onClick={handleShare} className="ml-auto text-neutral-500 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </motion.article>

        <CommentSection contentId={id} title="Contribuições de Elite" placeholder="Adicionar pensamento..." />
      </main>
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
