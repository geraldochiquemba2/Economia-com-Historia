import React, { useState } from "react";
import { Link, MemoryRouter } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { PlayCircle, FileText, Mic, Filter, ArrowLeft, Search, Compass } from "lucide-react";
import { exploreContents } from "../data/mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Explore() {
  const [filter, setFilter] = useState("all");

  const filteredContents =
    filter === "all" ? exploreContents : exploreContents.filter((c) => c.type === filter);

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      {/* Header - Glassmorphic themed banner */}
      <header className="px-6 pt-10 pb-6 sticky top-0 z-50 md:relative md:top-auto border-b md:border border-[#3A0310]/5 dark:border-white/5 bg-white/90 dark:bg-black/90 backdrop-blur-xl md:rounded-[2.5rem] md:mt-6 md:p-10 md:px-10 shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#3A0310]/5 dark:bg-[#3A0310]/30 rounded-2xl border border-[#3A0310]/20 dark:border-[#3A0310]/50 shadow-inner">
            <Compass className="w-6 h-6 text-[#3A0310] dark:text-[#E8B4B8]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-800 dark:text-white tracking-tight uppercase">Explorar</h1>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-black">Conhecimento de Prestígio</p>
          </div>
        </div>

        {/* Search Input with premium layout */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </div>
          <input 
            type="text" 
            placeholder="O que procuras?" 
            className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#3A0310]/50 focus:bg-neutral-100 dark:focus:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
          />
        </div>

        {/* Horizontal filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {["all", "video", "text", "jindungo", "podcast"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap active:scale-95 shadow-sm ${
                filter === f
                  ? "bg-[#3A0310] text-white border-[#E8B4B8]/30 shadow-[0_4px_15px_rgba(58,3,16,0.25)]"
                  : "bg-neutral-50 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-[#3A0310] dark:hover:text-neutral-200"
              }`}
            >
              {f === "all" && "Todos"}
              {f === "video" && "Vídeos"}
              {f === "text" && "Leituras"}
              {f === "jindungo" && "Com Jindungo 🔥"}
              {f === "podcast" && "Áudios"}
            </button>
          ))}
        </div>
      </header>

      {/* Grid Content with desktop columns and premium hover animations */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredContents.map((content, idx) => (
              <motion.div
                key={content.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: "easeOut" }}
              >
                <Link
                  to={`/app/explore/${content.id}`}
                  className="block bg-white dark:bg-white/5 rounded-[2.5rem] border-2 border-[#3A0310] dark:border-[#E8B4B8]/40 overflow-hidden hover:border-[#5A051A] dark:hover:border-[#E8B4B8]/80 hover:shadow-[0_20px_50px_rgba(58,3,16,0.12)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 group shadow-lg"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <ImageWithFallback
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 dark:from-[#0F0F0F]/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 right-4 z-20">
                      <span 
                        className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center shadow-2xl"
                        style={{ color: '#E8B4B8' }}
                      >
                        {content.type === "video" && <PlayCircle className="w-3.5 h-3.5 mr-1.5" style={{ color: '#E8B4B8' }} />}
                        {content.type === "text" && <FileText className="w-3.5 h-3.5 mr-1.5" style={{ color: '#E8B4B8' }} />}
                        {content.type === "podcast" && <Mic className="w-3.5 h-3.5 mr-1.5" style={{ color: '#E8B4B8' }} />}
                        {content.type === "jindungo" && <span className="mr-1.5">🔥</span>}
                        {content.type === "jindungo" ? "Jindungo" : content.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col justify-between min-h-[220px]">
                    <div>
                      <h3 className="font-black text-neutral-800 dark:text-white text-lg mb-2.5 group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors leading-tight uppercase tracking-tight">
                        {content.title}
                      </h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs line-clamp-2 leading-relaxed font-medium">
                        {content.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between border-t border-neutral-100 dark:border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#3A0310]/5 dark:bg-[#3A0310] flex items-center justify-center border border-[#3A0310]/10 dark:border-[#E8B4B8]/20">
                          <Compass className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" />
                        </div>
                        <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Nível Recomendado: 3</span>
                      </div>
                      <div className="flex items-center text-[#3A0310] dark:text-[#E8B4B8] font-black text-[9px] uppercase tracking-widest gap-1 group-hover:gap-2.5 transition-all">
                        Aceder <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
