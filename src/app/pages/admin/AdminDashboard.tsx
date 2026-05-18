import React from "react";
import { motion } from "motion/react";
import { Users, BookOpen, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react";
import { rankingData, exploreContents, forumTopics } from "../../data/mockData";

export function AdminDashboard() {
  const stats = [
    { label: "Usuários Ativos", value: rankingData.length * 142, icon: Users, color: "text-blue-400 bg-blue-900/30" },
    { label: "Conteúdos", value: exploreContents.length, icon: BookOpen, color: "text-emerald-400 bg-emerald-900/30" },
    { label: "Discussões", value: forumTopics.length, icon: MessageSquare, color: "text-purple-400 bg-purple-900/30" },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">Visão Geral</h1>
        <p className="text-gray-400 text-sm">Estatísticas do sistema e engajamento</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-2xl bg-gray-800 border border-gray-700 flex flex-col justify-between ${idx === 0 ? 'col-span-2' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 rounded-2xl border border-gray-700 p-5 mt-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" /> Atividade Recente
          </h2>
        </div>
        
        <div className="space-y-4">
          {[
            { msg: "Novo usuário registrado: Miguel T.", time: "Há 10 min", icon: Users },
            { msg: "Novo comentário no fórum: 'Inflação'", time: "Há 45 min", icon: MessageSquare },
            { msg: "15 novos alunos no Quiz", time: "Há 2 horas", icon: TrendingUp },
          ].map((act, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-gray-700 pb-3 last:border-0 last:pb-0">
              <div className="bg-gray-700 p-2 rounded-lg text-gray-300">
                <act.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-gray-200 font-medium">{act.msg}</p>
                <p className="text-xs text-gray-500 mt-1">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-amber-900/20 border border-amber-700/50 rounded-2xl p-4 flex items-start gap-3"
      >
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
        <div>
          <h3 className="text-amber-500 font-bold text-sm">Aviso de Sistema</h3>
          <p className="text-amber-200/80 text-xs mt-1">
            Lembre-se de aprovar os novos conteúdos sobre o período colonial na fila de moderação.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
