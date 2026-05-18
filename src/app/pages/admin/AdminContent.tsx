import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileVideo, Edit3, Trash2, PlusCircle, Filter } from "lucide-react";
import { exploreContents } from "../../data/mockData";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export function AdminContent() {
  const [items, setItems] = useState(exploreContents);
  const [filter, setFilter] = useState("all");

  const filteredItems = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="p-6 pb-24 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Gerir Conteúdo</h1>
          <p className="text-gray-400 text-sm">Adicione ou edite vídeos, textos e podcasts.</p>
        </div>
        <button className="bg-rose-600 text-white p-3 rounded-full shadow-lg shadow-rose-900/50 hover:scale-105 transition-transform">
          <PlusCircle className="w-6 h-6" />
        </button>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
        {["all", "video", "text", "podcast"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/50"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
            }`}
          >
            {f === "all" && "Todos"}
            {f === "video" && "Vídeos"}
            {f === "text" && "Textos"}
            {f === "podcast" && "Áudios"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-start gap-4 hover:border-gray-600 transition-colors"
            >
              <div className="w-16 h-16 bg-gray-900 rounded-xl overflow-hidden shrink-0 relative">
                <ImageWithFallback src={item.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  {item.type}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base truncate">{item.title}</h3>
                <p className="text-gray-400 text-xs line-clamp-2 mt-1">{item.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300">
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Apagar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 bg-gray-800/50 rounded-2xl border border-gray-700 border-dashed"
          >
            <FileVideo className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Nenhum conteúdo encontrado.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
