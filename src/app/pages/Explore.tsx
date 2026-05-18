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
    <div className="min-h-screen bg-[#0F0F0F] pb-24 text-neutral-100">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 bg-[#0F0F0F]/80 backdrop-blur-lg sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#3A0310]/30 rounded-xl border border-[#3A0310]/50">
            <Compass className="w-6 h-6 text-[#E8B4B8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Explorar</h1>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Conhecimento de Prestígio</p>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-500" />
          </div>
          <input 
            type="text" 
            placeholder="O que procuras?" 
            className="w-full bg-white/5 border border-white/10 text-white placeholder-neutral-500 rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#3A0310]/50 transition-all text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {["all", "video", "text", "jindungo", "podcast"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                filter === f
                  ? "bg-[#3A0310] text-white border-[#E8B4B8]/30 shadow-[0_0_15px_rgba(58,3,16,0.3)]"
                  : "bg-white/5 text-neutral-500 border-white/5 hover:bg-white/10 hover:text-neutral-300"
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

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredContents.map((content, idx) => (
              <motion.div
                key={content.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <Link
                  to={`/app/explore/${content.id}`}
                  className="block bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden hover:border-[#3A0310]/50 transition-all group shadow-2xl"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    <ImageWithFallback
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/60 backdrop-blur-md text-[#E8B4B8] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center shadow-2xl">
                        {content.type === "video" && <PlayCircle className="w-3.5 h-3.5 mr-1.5" />}
                        {content.type === "text" && <FileText className="w-3.5 h-3.5 mr-1.5" />}
                        {content.type === "podcast" && <Mic className="w-3.5 h-3.5 mr-1.5" />}
                        {content.type === "jindungo" && <span className="mr-1.5">🔥</span>}
                        {content.type === "jindungo" ? "Jindungo" : content.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-white text-xl mb-2 group-hover:text-[#E8B4B8] transition-colors leading-tight">
                      {content.title}
                    </h3>
                    <p className="text-neutral-400 text-sm line-clamp-2 leading-relaxed font-medium">
                      {content.description}
                    </p>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#3A0310] flex items-center justify-center border border-[#E8B4B8]/20">
                          <Compass className="w-4 h-4 text-[#E8B4B8]" />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Nível Recomendado: 3</span>
                      </div>
                      <div className="flex items-center text-[#E8B4B8] font-black text-[10px] uppercase tracking-widest gap-1 group-hover:gap-2 transition-all">
                        Aceder <ArrowLeft className="w-3 h-3 rotate-180" />
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
