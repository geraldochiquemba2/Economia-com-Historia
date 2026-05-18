import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, MoreVertical, Ban, Mail } from "lucide-react";
import { rankingData } from "../../data/mockData";

export function AdminUsers() {
  const [search, setSearch] = useState("");

  const filteredUsers = rankingData.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 pb-24 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Usuários</h1>
          <p className="text-gray-400 text-sm">Gerencie acessos e subscrições.</p>
        </div>
      </motion.div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Pesquisar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-gray-800 border-0 ring-1 ring-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-rose-500 transition-shadow text-gray-100 placeholder-gray-500"
        />
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all gap-4 group"
          >
            <div className="w-12 h-12 bg-rose-900 text-rose-200 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
              {user.name.charAt(0)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-100 truncate">{user.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{user.points} pts • Plano Gratuito</p>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-400 hover:text-white bg-gray-700 rounded-xl hover:bg-rose-600 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-400 bg-gray-700 rounded-xl hover:bg-gray-600 transition-colors">
                <Ban className="w-4 h-4" />
              </button>
            </div>
            
            <button className="p-2 text-gray-500 hover:text-white group-hover:hidden transition-opacity">
              <MoreVertical className="w-5 h-5" />
            </button>
          </motion.div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-10 bg-gray-800/50 rounded-2xl border border-gray-700 border-dashed">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Nenhum usuário encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
