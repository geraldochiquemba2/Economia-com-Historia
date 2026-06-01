import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, BookOpen, TrendingUp, AlertTriangle, ShieldAlert, Clock, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";

type Stats = {
  users: number;
  content: number;
  debates: number;
};

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, content: 0, debates: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, contentRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/users"),
        fetch("/api/content"),
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const contentData = await contentRes.json();

      setStats(statsData);
      setRecentUsers(Array.isArray(usersData) ? usersData.slice(0, 3) : []);
      setRecentContent(Array.isArray(contentData) ? contentData.slice(0, 3) : []);
    } catch {
      // Silent fail — show zeros
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statCards = [
    {
      label: "Utilizadores",
      value: stats.users,
      icon: Users,
      highlight: true,
      action: () => navigate("/admin/users"),
    },
    {
      label: "Conteúdos",
      value: stats.content,
      icon: BookOpen,
      highlight: false,
      action: () => navigate("/admin/content"),
    },
    {
      label: "Debates Ativos",
      value: stats.debates,
      icon: TrendingUp,
      highlight: false,
      action: () => {},
    },
  ];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `Há ${days} dia${days > 1 ? "s" : ""}`;
    if (hours > 0) return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
    if (mins > 0) return `Há ${mins} minuto${mins > 1 ? "s" : ""}`;
    return "Agora mesmo";
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3A0310] border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-6 h-6 force-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Visão Geral</h1>
            <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">Estatísticas e atividade do sistema</p>
          </div>
        </div>
        <button onClick={fetchData} disabled={loading} className="p-3 rounded-2xl border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors text-neutral-500 dark:text-neutral-400">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={stat.action}
            className={`p-5 rounded-[1.5rem] border shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform ${
              idx === 0
                ? "col-span-2 md:col-span-1 bg-gradient-to-br from-[#3A0310] to-[#140105] border-transparent"
                : "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10"
            }`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl ${idx === 0 ? "bg-white/10" : "bg-[#3A0310]/5 dark:bg-white/5"}`} />
            <div className="flex flex-col h-full justify-between relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner mb-4 ${idx === 0 ? "bg-white/10" : "bg-neutral-100 dark:bg-white/5"}`}>
                {loading ? (
                  <Loader2 className={`w-5 h-5 animate-spin ${idx === 0 ? "force-white" : "text-[#3A0310] dark:text-[#E8B4B8]"}`} />
                ) : (
                  <stat.icon className={`w-5 h-5 ${idx === 0 ? "force-white" : "text-[#3A0310] dark:text-[#E8B4B8]"}`} />
                )}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${idx === 0 ? "force-gold" : "text-neutral-500 dark:text-neutral-400"}`}>{stat.label}</p>
                <p className={`text-3xl font-black ${idx === 0 ? "force-white" : "text-[#3A0310] dark:text-white"}`}>
                  {loading ? "—" : stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Users */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3A0310] to-[#E8B4B8]/50" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#3A0310] dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4" /> Utilizadores Recentes
          </h2>
          <button onClick={() => navigate("/admin/users")} className="text-[9px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-[#3A0310] dark:hover:text-white transition-colors flex items-center gap-1">
            Ver todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" /></div>
          ) : recentUsers.length === 0 ? (
            <p className="text-center text-neutral-400 text-xs py-8 font-bold uppercase tracking-widest">Nenhum utilizador ainda.</p>
          ) : (
            recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 bg-neutral-50 dark:bg-white/5 rounded-xl p-3 border border-neutral-100 dark:border-white/5">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-black/10 dark:border-white/10 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-[#3A0310] to-[#5A051A] rounded-xl flex items-center justify-center font-black force-white text-lg shrink-0 border border-black/10 dark:border-white/10 shadow-sm">
                    {u.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm text-neutral-900 dark:text-white font-black uppercase tracking-tight truncate">{u.name}</p>
                    <span className="px-2 py-0.5 bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10 text-[#3A0310] dark:text-[#E8B4B8] rounded-md text-[8px] font-black uppercase tracking-widest">
                      {u.profession || 'Estudante'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-neutral-400 font-black uppercase tracking-widest shrink-0">
                  <Clock className="w-2.5 h-2.5" /> {timeAgo(u.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Recent Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E8B4B8]/50 to-[#3A0310]" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-[#3A0310] dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Conteúdos Recentes
          </h2>
          <button onClick={() => navigate("/admin/content")} className="text-[9px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 hover:text-[#3A0310] dark:hover:text-white transition-colors flex items-center gap-1">
            Ver todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" /></div>
          ) : recentContent.length === 0 ? (
            <p className="text-center text-neutral-400 text-xs py-8 font-bold uppercase tracking-widest">Nenhum conteúdo publicado ainda.</p>
          ) : (
            recentContent.map((c) => (
              <div key={c.id} className="flex items-center gap-3 bg-neutral-50 dark:bg-white/5 rounded-xl p-3 border border-neutral-100 dark:border-white/5">
                <div className="w-12 h-9 bg-neutral-200 dark:bg-white/10 rounded-xl overflow-hidden shrink-0">
                  {c.thumbnail ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-900 dark:text-white font-black uppercase tracking-tight truncate">{c.title}</p>
                  <span className="text-[9px] bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10 text-[#3A0310] dark:text-[#E8B4B8] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">{c.type}</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-neutral-400 font-black uppercase tracking-widest shrink-0">
                  <Clock className="w-2.5 h-2.5" /> {timeAgo(c.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-[#3A0310]/5 dark:bg-[#3A0310]/30 border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 rounded-[1.5rem] p-5 flex items-start gap-4 shadow-lg">
        <div className="bg-[#3A0310]/10 dark:bg-[#E8B4B8]/20 p-2 rounded-xl shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
        <div>
          <h3 className="text-[#3A0310] dark:text-[#E8B4B8] font-black text-xs uppercase tracking-widest mb-1">Aviso do Sistema</h3>
          <p className="text-neutral-700 dark:text-white/80 text-xs font-medium leading-relaxed">
            Todos os conteúdos publicados ficam visíveis imediatamente para todos os utilizadores do site.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
