import React, { useState, useMemo } from "react";
import { Link, MemoryRouter } from "react-router";
import { motion } from "motion/react";
import { MessageSquare, PlusCircle, Search, Clock, ThumbsUp, ArrowLeft, TrendingUp, Users } from "lucide-react";
import { forumTopics } from "../data/mockData";

export function Forum() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"recent" | "oldest" | "popular">("recent");

  const filteredAndSortedTopics = useMemo(() => {
    let result = forumTopics.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    );

    // Sorting logic
    if (filter === "popular") {
      result = [...result].sort((a, b) => b.comments - a.comments);
    } else if (filter === "oldest") {
      const dateWeight: Record<string, number> = {
        "Hoje": 0,
        "Ontem": 1,
        "2 dias atrás": 2
      };
      result = [...result].sort((a, b) => (dateWeight[b.date] || 0) - (dateWeight[a.date] || 0));
    } else {
      const dateWeight: Record<string, number> = {
        "Hoje": 0,
        "Ontem": 1,
        "2 dias atrás": 2
      };
      result = [...result].sort((a, b) => (dateWeight[a.date] || 0) - (dateWeight[b.date] || 0));
    }

    return result;
  }, [search, filter]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] pb-24 text-neutral-100">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 bg-[#0F0F0F]/80 backdrop-blur-lg sticky top-0 z-50 border-b border-white/5">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3A0310]/30 rounded-xl border border-[#3A0310]/50">
              <Users className="w-6 h-6 text-[#E8B4B8]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Fórum</h1>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Círculo de Discussão</p>
            </div>
          </div>
          <button className="bg-[#3A0310] text-white p-3 rounded-2xl shadow-lg hover:bg-[#5A051A] transition-all border border-[#E8B4B8]/20 group active:scale-95">
            <PlusCircle className="w-6 h-6 text-[#E8B4B8] group-hover:scale-110 transition-transform" />
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar debates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-neutral-500 rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#3A0310]/50 transition-all text-sm"
          />
        </div>

        <div className="flex gap-2">
          {["recent", "popular", "oldest"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === f
                  ? "bg-[#3A0310] text-white border-[#E8B4B8]/30"
                  : "bg-white/5 text-neutral-500 border-white/5 hover:bg-white/10"
              }`}
            >
              {f === "recent" && "Recentes"}
              {f === "popular" && "Populares"}
              {f === "oldest" && "Antigos"}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 space-y-4">
        {filteredAndSortedTopics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={`/app/forum/${topic.id}`}
              className="group block p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#3A0310]/40 hover:bg-white/[0.07] transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#3A0310] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <h3 className="font-bold text-white text-lg mb-4 group-hover:text-[#E8B4B8] transition-colors leading-snug">
                {topic.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center text-xs font-black text-[#E8B4B8] border border-white/10">
                    {topic.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold leading-none mb-1">{topic.author}</p>
                    <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">Académico Nível 2</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-neutral-500 text-[10px] font-bold uppercase tracking-tighter">
                  <span className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
                    <Clock className="w-3 h-3 text-[#3A0310]" /> 
                    {topic.date}
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5 group-hover:text-[#E8B4B8] transition-colors">
                    <MessageSquare className="w-3 h-3 text-[#3A0310]" /> 
                    {topic.comments}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {filteredAndSortedTopics.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-600">
            <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-xs">O silêncio reina por aqui...</p>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center pb-10">
         <Link to="/app" className="inline-flex items-center gap-2 text-neutral-500 font-black uppercase tracking-widest text-[10px] hover:text-[#E8B4B8] transition-colors">
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
