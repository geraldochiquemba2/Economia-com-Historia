import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, MoreVertical, Ban, Mail, ShieldAlert } from "lucide-react";
import { rankingData } from "../../data/mockData";

export function AdminUsers() {
  const [search, setSearch] = useState("");

  const filteredUsers = rankingData.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-2"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#3A0310] dark:bg-[#3A0310]/20 border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
          <Users className="w-6 h-6 force-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Usuários</h1>
          <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">Gerencie acessos e subscrições</p>
        </div>
      </motion.div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
        </div>
        <input
          type="text"
          placeholder="Pesquisar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[1.5rem] shadow-md focus:ring-2 focus:ring-[#3A0310]/30 focus:border-[#3A0310] transition-all text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 text-xs font-bold uppercase tracking-wider outline-none"
        />
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center p-4 bg-white dark:bg-white/5 rounded-[1.5rem] border border-[#3A0310]/30 dark:border-white/10 hover:border-[#3A0310]/60 dark:hover:border-[#E8B4B8]/40 transition-all gap-4 group shadow-md hover:shadow-lg"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#3A0310] to-[#5A051A] force-white rounded-[1rem] flex items-center justify-center font-black text-lg shadow-inner border border-[#E8B4B8]/20 shrink-0">
                {user.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm text-[#3A0310] dark:text-white uppercase tracking-tight truncate">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black text-[#E8B4B8] dark:text-[#E8B4B8] uppercase tracking-widest bg-[#3A0310]/5 dark:bg-[#E8B4B8]/10 px-2 py-0.5 rounded-md">
                    {user.points} pts
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                    Plano Gratuito
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button className="p-2.5 text-[#3A0310] dark:text-[#E8B4B8] hover:text-white bg-[#3A0310]/5 dark:bg-[#E8B4B8]/10 hover:bg-[#3A0310] dark:hover:bg-[#E8B4B8]/30 rounded-xl transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
                <button className="p-2.5 text-red-600 dark:text-red-400 hover:text-white bg-red-50 dark:bg-red-500/10 hover:bg-red-500 dark:hover:bg-red-500/30 rounded-xl transition-colors">
                  <Ban className="w-4 h-4" />
                </button>
              </div>
              
              <button className="p-2.5 text-neutral-400 dark:text-neutral-500 hover:text-[#3A0310] dark:hover:text-white md:group-hover:hidden transition-opacity shrink-0">
                <MoreVertical className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 border-dashed backdrop-blur-sm"
          >
            <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px]">Nenhum usuário encontrado.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
