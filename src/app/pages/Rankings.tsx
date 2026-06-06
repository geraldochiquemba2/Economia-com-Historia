import React, { useState, useEffect } from "react";
import { Link, MemoryRouter } from "react-router";
import { motion } from "motion/react";
import { Trophy, Award, ArrowLeft, RefreshCw } from "lucide-react";



export function Rankings() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rankings')
      .then(res => res.json())
      .then(data => { setRankings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-[#3A0310] animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-24 flex flex-col items-center justify-start transition-colors duration-300 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md md:max-w-2xl flex flex-col pt-10 px-6 h-full"
      >
        <div className="flex items-center gap-4 mb-10">
          <Link to="/app" className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-white/10 text-neutral-500 hover:text-[#3A0310] dark:hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-neutral-800 dark:text-white uppercase tracking-tight">Círculo de Elite</h2>
            <p className="text-[10px] text-[#3A0310] dark:text-[#E8B4B8] uppercase tracking-widest font-black">Os 10 Maiores Académicos</p>
          </div>
        </div>

        {/* Podium Section */}
        <div className="flex justify-center items-end gap-3 mb-12 h-64 relative">
          <div className="absolute inset-0 bg-[#3A0310]/5 rounded-[3rem] -z-10"></div>

          {/* 2nd Place */}
          <div className="flex flex-col items-center flex-1 h-[75%] group">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl border-2 border-neutral-400 dark:border-neutral-600 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                {rankings[1]?.avatar
                  ? <img src={rankings[1].avatar} alt="2nd" className="w-full h-full object-cover" />
                  : <span className="text-xl font-black text-neutral-400 dark:text-neutral-500">{rankings[1]?.name?.charAt(0) || "?"}</span>
                }
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-neutral-600 rounded-lg flex items-center justify-center text-xs font-black shadow-xl border border-white/10" style={{ color: '#ffffff' }}>2º</div>
            </div>
            <p className="text-neutral-700 dark:text-white font-bold text-[10px] text-center mb-1 truncate w-full uppercase tracking-tighter">{rankings[1]?.name || "2º Lugar"}</p>
            <div className="w-full flex-1 bg-white dark:bg-white/5 backdrop-blur-md rounded-t-2xl border-t border-x border-[#E8B4B8] dark:border-white/10 flex flex-col items-center justify-center pt-4 shadow-2xl">
               <Award className="w-5 h-5 text-neutral-400 opacity-50 mb-2" />
               <span className="text-neutral-500 dark:text-neutral-400 font-black text-xs">{rankings[1]?.xp ?? 0} XP</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center flex-1 h-full group">
            <div className="relative mb-4">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <Trophy className="w-8 h-8 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              </div>
              <div className="w-20 h-20 rounded-2xl border-2 border-[#3A0310] dark:border-[#E8B4B8] overflow-hidden shadow-[0_0_40px_rgba(58,3,16,0.2)] group-hover:scale-105 transition-transform duration-500 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                {rankings[0]?.avatar
                  ? <img src={rankings[0].avatar} alt="1st" className="w-full h-full object-cover" />
                  : <span className="text-2xl font-black text-[#3A0310] dark:text-[#E8B4B8]">{rankings[0]?.name?.charAt(0) || "?"}</span>
                }
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#3A0310] rounded-lg flex items-center justify-center text-xs font-black text-white shadow-xl border border-[#E8B4B8]/30">1º</div>
            </div>
            <p className="text-neutral-800 dark:text-white font-black text-xs text-center mb-1 truncate w-full uppercase tracking-tight">{rankings[0]?.name || "1º Lugar"}</p>
            <div className="w-full flex-1 bg-gradient-to-t from-[#3A0310]/10 dark:from-[#3A0310]/40 to-neutral-50 dark:to-white/10 backdrop-blur-md rounded-t-[2.5rem] border-t border-x border-[#E8B4B8] dark:border-[#3A0310]/50 flex flex-col items-center justify-center pt-6 shadow-2xl">
               <Award className="w-6 h-6 text-[#3A0310] dark:text-[#E8B4B8] mb-2" />
               <span className="text-[#3A0310] dark:text-[#E8B4B8] font-black text-sm">{rankings[0]?.xp ?? 0} XP</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center flex-1 h-[65%] group">
            <div className="relative mb-3">
              <div className="w-14 h-14 rounded-2xl border-2 border-orange-200 dark:border-orange-900/50 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                {rankings[2]?.avatar
                  ? <img src={rankings[2].avatar} alt="3rd" className="w-full h-full object-cover" />
                  : <span className="text-xl font-black text-neutral-400 dark:text-neutral-500">{rankings[2]?.name?.charAt(0) || "?"}</span>
                }
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-700/80 dark:bg-orange-900/50 rounded-lg flex items-center justify-center text-xs font-black shadow-xl border border-white/10" style={{ color: '#ffffff' }}>3º</div>
            </div>
            <p className="text-neutral-700 dark:text-white font-bold text-[10px] text-center mb-1 truncate w-full uppercase tracking-tighter">{rankings[2]?.name || "3º Lugar"}</p>
            <div className="w-full flex-1 bg-white dark:bg-white/5 backdrop-blur-md rounded-t-xl border-t border-x border-[#E8B4B8] dark:border-white/10 flex flex-col items-center justify-center pt-2 shadow-2xl">
               <Award className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mb-1" />
               <span className="text-neutral-500 font-black text-[10px]">{rankings[2]?.xp ?? 0} XP</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pb-8 hide-scrollbar">
          {rankings.slice(3).map((user: any, idx: number) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * idx }}
              key={user.id}
              className="flex items-center p-4 bg-white dark:bg-white/5 rounded-2xl border border-neutral-100 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/10 hover:border-[#3A0310]/30 transition-all group shadow-sm"
            >
              <span className="w-8 font-black text-neutral-400 group-hover:text-[#3A0310] dark:group-hover:text-white transition-colors">{idx + 4}</span>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-700 dark:text-white text-sm leading-tight uppercase tracking-tight">{user.name}</h3>
                <p className="text-neutral-400 dark:text-neutral-500 text-[9px] font-black tracking-widest uppercase mt-0.5">Membro de Elite</p>
              </div>
              <div className="bg-neutral-100 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-white/5 shadow-inner">
                <span className="text-[#3A0310] dark:text-[#E8B4B8] font-black text-[10px] tracking-widest">{user.xp} XP</span>
              </div>
            </motion.div>
          ))}
          {rankings.length === 0 && (
            <div className="text-center py-16 text-neutral-400 font-medium">
              Nenhum académico no ranking ainda.<br />
              <span className="text-xs">Jogue o Quiz para aparecer aqui!</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function RankingsPreview() {
  return (
    <MemoryRouter>
      <Rankings />
    </MemoryRouter>
  );
}
