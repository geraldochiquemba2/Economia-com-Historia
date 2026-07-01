import React, { useState, useEffect, useMemo } from "react";
import { Link, MemoryRouter } from "react-router";
import { motion } from "motion/react";
import { MessageSquare, PlusCircle, Search, Clock, ThumbsUp, ThumbsDown, ArrowLeft, Users, Loader2 } from "lucide-react";

export function Forum() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"recent" | "oldest" | "popular">("recent");
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'admin';

  // Buscar tópicos de fórum da API (type=forum)
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch('/api/content');
        const data = await res.json();
        if (Array.isArray(data)) setTopics(data.filter((t: any) => t.type === 'forum'));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchTopics();
    const interval = setInterval(fetchTopics, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedTopics = useMemo(() => {
    let result = topics.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );

    if (filter === "popular") {
      result = [...result].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    } else if (filter === "oldest") {
      result = [...result].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [search, filter, topics]);

  function timeAgo(dateStr: string) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)}h`;
    return `há ${Math.floor(diff / 86400)} dia${Math.floor(diff / 86400) === 1 ? '' : 's'}`;
  }

  return (
    <div className="min-h-screen pb-16 transition-colors duration-300 md:max-w-3xl md:mx-auto">
      {/* Header */}
      <header className="px-6 pt-6 pb-5 sticky top-0 z-50 md:relative md:top-auto border-b md:border border-[#3A0310]/10 dark:border-white/5 bg-gradient-to-br from-white/95 to-neutral-50/95 dark:from-[#0F0F0F]/95 dark:to-[#1A1A1A]/95 backdrop-blur-xl md:rounded-[2rem] md:mt-6 md:p-6 md:px-8 shadow-2xl transition-all duration-300 relative overflow-hidden">
        
        <div className="absolute inset-0 z-0 opacity-10 dark:opacity-[0.08] grayscale mix-blend-overlay pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
            className="w-full h-full object-cover" 
            alt="" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3A0310]/5 via-transparent to-transparent z-0 pointer-events-none" />

        <div className="relative z-10 w-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3A0310]/5 dark:bg-[#3A0310]/30 rounded-xl border border-[#3A0310]/20 dark:border-[#3A0310]/50 shadow-inner">
                <Users className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
              </div>
              <div>
                <h1 className="text-xl font-black text-neutral-800 dark:text-white tracking-tight uppercase">Fórum</h1>
                <p className="text-[9px] text-neutral-400 dark:text-white uppercase tracking-widest font-black">Círculo de Discussão</p>
              </div>
            </div>
            {isAdmin && (
              <Link
                to="/admin/content"
                className="bg-[#3A0310] force-white p-2.5 rounded-xl shadow-md hover:bg-[#5A051A] transition-all border border-[#E8B4B8]/20 group active:scale-95"
              >
                <PlusCircle className="w-5 h-5 force-gold group-hover:scale-110 transition-transform" />
              </Link>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-400 dark:text-white" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar debates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#3A0310]/50 focus:bg-neutral-100 dark:focus:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
              />
            </div>

            <div className="flex gap-1.5 md:w-80">
              {["recent", "popular", "oldest"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 shadow-sm ${
                    filter === f
                      ? "bg-[#3A0310] force-white border-[#E8B4B8]/30 shadow-[0_4px_15px_rgba(58,3,16,0.25)]"
                      : "bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-white border-neutral-200 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#3A0310] dark:hover:text-white"
                  }`}
                >
                  {f === "recent" && "Recentes"}
                  {f === "popular" && "Populares"}
                  {f === "oldest" && "Antigos"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Forum list */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-[#3A0310] dark:text-[#E8B4B8] animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">A carregar debates...</p>
          </div>
        ) : filteredAndSortedTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
          >
            <Link
              to={`/app/forum/${topic.id}`}
              className="group block p-4.5 px-5 bg-white dark:bg-white/5 rounded-[1.5rem] border-2 border-[#3A0310] dark:border-[#E8B4B8]/40 hover:border-[#5A051A] dark:hover:border-[#E8B4B8]/80 transition-all duration-300 relative overflow-hidden shadow-md"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#3A0310] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <h3 className="font-black text-neutral-800 dark:text-white text-base mb-2.5 group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors leading-snug uppercase tracking-tight">
                {topic.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center text-[10px] font-black force-gold border border-white/10 shadow-md">
                    {(topic.author || 'A').charAt(0)}
                  </div>
                  <div>
                    <p className="text-neutral-800 dark:text-white text-xs font-bold leading-none mb-0.5">{topic.author || 'Autor'}</p>
                    <p className="text-neutral-400 dark:text-white text-[8px] font-black uppercase tracking-widest">Académico</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-neutral-400 dark:text-white text-[8px] font-bold uppercase tracking-widest flex-wrap mt-2">
                  <span className="flex items-center gap-1 bg-neutral-100 dark:bg-black/40 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-white/5" title="Data">
                    <Clock className="w-3 h-3 text-[#3A0310] dark:text-white" /> 
                    {timeAgo(topic.createdAt)}
                  </span>
                  <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400" title="Gostos">
                    <ThumbsUp className="w-3 h-3" /> 
                    {topic.likes?.length || 0}
                  </span>
                  <span className="flex items-center gap-1 bg-[#3A0310]/5 dark:bg-[#E8B4B8]/10 px-2 py-0.5 rounded-lg border border-[#3A0310]/10 dark:border-[#E8B4B8]/20 text-[#3A0310] dark:text-[#E8B4B8]" title="Discussões">
                    <MessageSquare className="w-3 h-3" /> 
                    {topic.commentCount || 0}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {!loading && filteredAndSortedTopics.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-neutral-400 dark:text-neutral-600">
            <MessageSquare className="w-16 h-16 mb-4 opacity-15" />
            <p className="font-bold uppercase tracking-widest text-xs">O silêncio reina por aqui...</p>
            {isAdmin && <p className="text-[10px] mt-2 opacity-60">Cria um novo tópico no painel Admin → Conteúdo</p>}
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center pb-6">
         <Link to="/app" className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#3A0310] dark:hover:text-[#E8B4B8] font-black uppercase tracking-widest text-[9px] transition-colors">
            <ArrowLeft className="w-3 h-3" /> Voltar ao Início
         </Link>
      </div>
    </div>
  );
}

export default function ForumPreview() {
  return (
    <MemoryRouter>
      <Forum />
    </MemoryRouter>
  );
}
