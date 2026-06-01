import React, { useState, useEffect } from "react";
import { Link, MemoryRouter } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { PlayCircle, FileText, Mic, Search, Compass, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
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
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((data) => setContents(Array.isArray(data) ? data : []))
      .catch(() => setContents([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contents.filter((c) => {
    const matchType = filter === "all" || c.type === filter;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const typeIcon = (type: string) => {
    if (type === "video") return <PlayCircle className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1.5" />;
    if (type === "text") return <FileText className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1.5" />;
    if (type === "podcast") return <Mic className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1.5" />;
    if (type === "forum") return <MessageSquare className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1.5" />;
    if (type === "jindungo") return <span className="mr-0.5 md:mr-1.5">🔥</span>;
    return null;
  };

  const typeLabel = (type: string) => {
    if (type === "jindungo") return "Jindungo";
    if (type === "podcast") return "Áudio";
    if (type === "text") return "Leitura";
    if (type === "forum") return "Fórum";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 sticky top-0 z-50 md:relative md:top-auto border-b md:border border-[#3A0310]/5 dark:border-white/5 bg-white/90 dark:bg-black/90 backdrop-blur-xl md:rounded-[2.5rem] md:mt-6 md:p-10 md:px-10 shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#3A0310]/5 dark:bg-[#3A0310]/30 rounded-2xl border border-[#3A0310]/20 dark:border-[#3A0310]/50 shadow-inner">
            <Compass className="w-6 h-6 text-[#3A0310] dark:text-[#E8B4B8]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-800 dark:text-white tracking-tight uppercase">Explorar</h1>
            <p className="text-[10px] text-neutral-400 dark:text-white uppercase tracking-widest font-black">Conhecimento de Prestígio</p>
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
            className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-white rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#3A0310]/50 focus:bg-neutral-100 dark:focus:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {["all", "jindungo", "video", "text", "podcast", "forum"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[8px] md:text-xs font-black uppercase tracking-wider md:tracking-widest transition-all border whitespace-nowrap active:scale-95 shadow-sm flex-shrink-0 ${
                filter === f
                  ? "bg-[#3A0310] border-[#E8B4B8]/30 shadow-[0_4px_15px_rgba(58,3,16,0.25)]"
                  : "bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-white border-neutral-200 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#3A0310] dark:hover:text-white"
              }`}
              style={filter === f ? { color: "white" } : {}}
            >
              {f === "all" && "Todos"}
              {f === "jindungo" && "Jindungo 🔥"}
              {f === "video" && "Vídeos"}
              {f === "text" && "Leituras"}
              {f === "podcast" && "Áudios"}
              {f === "forum" && "Fórum"}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[#3A0310] dark:text-[#E8B4B8] animate-spin" />
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">A carregar conteúdos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Compass className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400 text-center">
              {search ? "Nenhum resultado para a sua pesquisa." : "Nenhum conteúdo disponível ainda."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
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
                    className="block bg-white dark:bg-white/5 rounded-2xl md:rounded-[2.5rem] border-2 border-[#3A0310] dark:border-[#E8B4B8]/40 overflow-hidden hover:border-[#5A051A] dark:hover:border-[#E8B4B8]/80 hover:shadow-[0_20px_50px_rgba(58,3,16,0.12)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 group shadow-lg flex flex-col h-full"
                  >
                    <div className="relative h-24 md:h-48 w-full overflow-hidden shrink-0">
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
                        <div className="w-full h-full bg-[#3A0310]/5 dark:bg-[#3A0310]/20 flex items-center justify-center">
                          <Compass className="w-8 h-8 text-[#3A0310]/30 dark:text-[#E8B4B8]/30" />
                        </div>
                      )}
                      <div className="absolute z-20 inset-0 bg-gradient-to-t from-neutral-900/80 dark:from-[#0F0F0F]/80 via-transparent to-transparent" />


                    </div>

                    <div className="p-3 md:p-6 flex flex-col justify-between grow">
                      <div>
                        <div className="flex items-center gap-2 mb-1 md:mb-2.5 flex-wrap">
                          <h3 className="font-black text-neutral-800 dark:text-white text-xs md:text-lg group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                            {content.title}
                          </h3>
                          <span className="shrink-0 flex items-center gap-0.5 bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10 text-[#3A0310] dark:text-[#E8B4B8] text-[7px] md:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-red-500">
                            {typeIcon(content.type)}{typeLabel(content.type)}
                          </span>
                        </div>
                        <p className="text-neutral-500 dark:text-white text-[8px] md:text-xs line-clamp-2 leading-relaxed font-medium">
                          {content.description}
                        </p>
                      </div>

                      <div className="mt-3 md:mt-6 flex items-center justify-between border-t border-neutral-100 dark:border-white/5 pt-2 md:pt-4">
                        <div className="flex items-center gap-1 md:gap-2">
                          <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-[#3A0310]/5 dark:bg-[#3A0310] flex items-center justify-center border border-[#3A0310]/10 dark:border-[#E8B4B8]/20 shrink-0">
                            <Compass className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#3A0310] dark:text-[#E8B4B8]" />
                          </div>
                          <span className="text-[6px] md:text-[9px] font-black text-neutral-400 dark:text-white uppercase tracking-widest leading-tight">Nível: 3</span>
                        </div>
                        <div className="flex items-center text-[#3A0310] dark:text-[#E8B4B8] font-black text-[6px] md:text-[9px] uppercase tracking-widest gap-0.5 md:gap-1 group-hover:gap-1.5 md:group-hover:gap-2.5 transition-all whitespace-nowrap">
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
