import React from "react";
import { motion } from "motion/react";
import { Users, BookOpen, MessageSquare, TrendingUp, AlertTriangle, ShieldAlert, Clock, ChevronRight } from "lucide-react";
import { rankingData, exploreContents, forumTopics } from "../../data/mockData";

export function AdminDashboard() {
  const stats = [
    { label: "Usuários Ativos", value: rankingData.length * 142, icon: Users, color: "from-[#3A0310] to-[#5A051A]" },
    { label: "Conteúdos", value: exploreContents.length, icon: BookOpen, color: "from-neutral-800 to-neutral-900" },
    { label: "Discussões", value: forumTopics.length, icon: MessageSquare, color: "from-neutral-800 to-neutral-900" },
  ];

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-2"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#3A0310] dark:bg-[#3A0310]/20 border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-6 h-6 force-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Visão Geral</h1>
          <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">Estatísticas do sistema e engajamento</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className={`p-5 rounded-[1.5rem] bg-gradient-to-br border shadow-xl relative overflow-hidden group ${
              idx === 0 
                ? 'col-span-2 md:col-span-1 border-transparent dark:border-[#E8B4B8]/30 from-[#3A0310]/95 to-[#140105]' 
                : 'border-neutral-200 dark:border-white/10 from-white to-neutral-50 dark:from-white/5 dark:to-transparent'
            }`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl group-hover:bg-white/20 transition-colors ${idx === 0 ? 'bg-white/10' : 'bg-[#3A0310]/5 dark:bg-white/5'}`}></div>
            <div className="flex flex-col h-full justify-between relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                  idx === 0 ? 'bg-white/10' : 'bg-neutral-100 dark:bg-white/5'
                }`}>
                  <stat.icon className={`w-5 h-5 ${idx === 0 ? 'force-white' : 'text-[#3A0310] dark:text-[#E8B4B8]'}`} />
                </div>
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${idx === 0 ? 'force-gold' : 'text-neutral-500 dark:text-neutral-400'}`}>
                  {stat.label}
                </p>
                <p className={`text-3xl font-black ${idx === 0 ? 'force-white' : 'text-[#3A0310] dark:text-white'}`}>{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white dark:bg-white/5 backdrop-blur-md rounded-[2rem] border border-neutral-200 dark:border-white/10 p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3A0310] to-[#E8B4B8]/50"></div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#3A0310] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" /> Atividade Recente
          </h2>
          <button className="text-[9px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-[#3A0310] dark:hover:text-white transition-colors flex items-center gap-1">
            Ver tudo <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="space-y-4">
          {[
            { msg: "Novo usuário registrado: Miguel T.", time: "Há 10 min", icon: Users, color: "text-blue-500 dark:text-blue-400" },
            { msg: "Novo comentário no fórum: 'Inflação'", time: "Há 45 min", icon: MessageSquare, color: "text-emerald-500 dark:text-emerald-400" },
            { msg: "15 novos alunos no Quiz", time: "Há 2 horas", icon: BookOpen, color: "text-purple-500 dark:text-purple-400" },
          ].map((act, i) => (
            <div key={i} className="flex items-center gap-4 bg-neutral-50 dark:bg-white/5 rounded-xl p-3 border border-neutral-100 dark:border-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors group cursor-pointer">
              <div className="bg-white dark:bg-black/30 p-2.5 rounded-lg border border-neutral-200 dark:border-white/5 group-hover:border-[#3A0310]/20 dark:group-hover:border-white/10 transition-colors shadow-sm">
                <act.icon className={`w-4 h-4 ${act.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-neutral-800 dark:text-neutral-200 font-bold tracking-wide">{act.msg}</p>
                <div className="flex items-center gap-1.5 mt-1 text-neutral-500 text-[9px] font-black uppercase tracking-widest">
                  <Clock className="w-2.5 h-2.5" /> {act.time}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600 group-hover:text-[#3A0310] dark:group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* System Warning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-[#3A0310]/5 dark:bg-[#3A0310]/30 border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 rounded-[1.5rem] p-5 flex items-start gap-4 relative overflow-hidden group shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#3A0310]/10 dark:from-[#3A0310]/50 to-transparent opacity-50"></div>
        <div className="bg-[#3A0310]/10 dark:bg-[#E8B4B8]/20 p-2 rounded-xl border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 relative z-10 shrink-0 shadow-inner">
          <AlertTriangle className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
        <div className="relative z-10">
          <h3 className="text-[#3A0310] dark:text-[#E8B4B8] font-black text-xs uppercase tracking-widest mb-1.5">Aviso de Sistema</h3>
          <p className="text-neutral-700 dark:text-white/80 text-xs font-medium leading-relaxed">
            Lembre-se de aprovar os novos conteúdos sobre o período colonial na fila de moderação.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
