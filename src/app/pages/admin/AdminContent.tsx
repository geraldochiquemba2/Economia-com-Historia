import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileVideo, Edit3, Trash2, PlusCircle, LayoutGrid } from "lucide-react";
import { exploreContents } from "../../data/mockData";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export function AdminContent() {
  const [items, setItems] = useState(exploreContents);
  const [filter, setFilter] = useState("all");

  const filteredItems = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-2"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3A0310] dark:bg-[#3A0310]/20 border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
            <FileVideo className="w-6 h-6 force-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Gerir Conteúdo</h1>
            <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">Vídeos, textos e podcasts</p>
          </div>
        </div>
        <button className="bg-[#3A0310] p-3 rounded-2xl border border-[#E8B4B8]/30 shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center">
          <PlusCircle className="w-6 h-6 force-gold" />
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
        {["all", "video", "text", "podcast"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              filter === f
                ? "bg-[#3A0310] force-white border-[#E8B4B8]/30 shadow-[0_4px_15px_rgba(58,3,16,0.25)]"
                : "bg-white dark:bg-white/5 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/10"
            }`}
          >
            {f === "all" && "Todos"}
            {f === "video" && "Vídeos"}
            {f === "text" && "Textos"}
            {f === "podcast" && "Áudios"}
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[1.5rem] overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="h-32 bg-neutral-100 dark:bg-[#0F0F0F] relative w-full overflow-hidden border-b border-neutral-100 dark:border-white/5">
                <ImageWithFallback src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 dark:opacity-70 grayscale-[20%]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] font-black force-white uppercase tracking-widest shadow-sm">
                  {item.type}
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-[#3A0310] dark:text-white font-black text-sm uppercase tracking-tight line-clamp-1 mb-1">{item.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-[10px] font-medium leading-relaxed line-clamp-2 flex-1">{item.description}</p>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-white/10">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest text-[#3A0310] dark:text-[#E8B4B8] bg-[#3A0310]/5 dark:bg-[#E8B4B8]/10 rounded-xl hover:bg-[#3A0310]/10 dark:hover:bg-[#E8B4B8]/20 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Apagar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 border-dashed backdrop-blur-sm"
        >
          <LayoutGrid className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px]">Nenhum conteúdo encontrado.</p>
        </motion.div>
      )}
    </div>
  );
}
