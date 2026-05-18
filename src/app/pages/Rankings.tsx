import React from "react";
import { Link, MemoryRouter } from "react-router";
import { motion } from "motion/react";
import { Trophy, Crown, Medal, ChevronLeft, Star, TrendingUp, Users } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Rankings() {
  const topUsers = [
    { id: 1, name: "Ana Mendes", xp: "12,450", level: 12, rank: 2, avatar: "https://i.pravatar.cc/150?u=ana" },
    { id: 2, name: "Marcos Silva", xp: "15,820", level: 15, rank: 1, avatar: "https://i.pravatar.cc/150?u=marcos" },
    { id: 3, name: "João Pedro", xp: "11,200", level: 10, rank: 3, avatar: "https://i.pravatar.cc/150?u=joao" },
  ];

  const others = [
    { id: 4, name: "Carla Antunes", xp: "9,800", level: 9, rank: 4 },
    { id: 5, name: "Ricardo Dias", xp: "8,450", level: 8, rank: 5 },
    { id: 6, name: "Sofia Lopes", xp: "7,900", level: 7, rank: 6 },
    { id: 7, name: "Miguel Sousa", xp: "6,200", level: 6, rank: 7 },
  ];

  return (
    <div className="bg-[#0F0F0F] min-h-screen pb-24 text-neutral-100 selection:bg-[#3A0310]">
      {/* Header */}
      <header className="px-6 pt-10 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#3A0310]/30 to-transparent" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#3A0310] rounded-full blur-[100px] opacity-20" />
        
        <div className="relative z-10 flex flex-col items-center">
          <Link to="/app" className="absolute left-0 top-0 p-2 bg-white/5 rounded-xl border border-white/10">
            <ChevronLeft className="w-5 h-5 text-neutral-400" />
          </Link>
          
          <div className="w-16 h-16 bg-[#3A0310] rounded-2xl flex items-center justify-center border border-[#E8B4B8]/30 shadow-[0_0_30px_rgba(58,3,16,0.5)] mb-6">
            <Trophy className="w-8 h-8 text-[#E8B4B8]" />
          </div>
          
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Panteão de Prestígio</h1>
          <p className="text-[#E8B4B8] font-bold text-[10px] uppercase tracking-[0.25em]">Os Maiores Eruditos da Semana</p>
        </div>
      </header>

      {/* Podium Section */}
      <div className="px-6 -mt-10 relative z-20">
        <div className="flex items-end justify-center gap-2 sm:gap-4 mb-16">
          {/* 2nd Place */}
          <PodiumPosition user={topUsers[0]} height="h-40" place={2} delay={0.2} />
          
          {/* 1st Place */}
          <PodiumPosition user={topUsers[1]} height="h-52" place={1} delay={0.1} isMain />
          
          {/* 3rd Place */}
          <PodiumPosition user={topUsers[2]} height="h-32" place={3} delay={0.3} />
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-6 mb-6">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Círculo de Ascensão</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Ativos</span>
            </div>
          </div>

          <div className="space-y-3">
            {others.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-neutral-600 w-4 group-hover:text-[#E8B4B8] transition-colors">{user.rank}</span>
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-xs font-black text-neutral-400">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#E8B4B8] transition-colors">{user.name}</h4>
                    <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Nível {user.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-white">{user.xp}</div>
                  <div className="text-[9px] text-[#E8B4B8] font-bold uppercase tracking-widest">XP</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Your Current Rank - Fixed Bottom? No, just a card */}
        <div className="mt-12 p-6 bg-gradient-to-br from-[#3A0310] to-[#1A0107] rounded-[2.5rem] border border-[#E8B4B8]/20 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Crown className="w-20 h-20 text-white" />
           </div>
           <div className="relative z-10 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                 <span className="text-2xl font-black text-white">#4</span>
               </div>
               <div>
                 <h4 className="text-white font-bold text-lg leading-tight">O Teu Progresso</h4>
                 <p className="text-[#E8B4B8]/80 text-xs font-medium uppercase tracking-widest mt-1">Faltam 1.250 XP para o #3</p>
               </div>
             </div>
             <button className="bg-white text-[#3A0310] px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-xl">
               Aumentar Nível
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function PodiumPosition({ user, height, place, delay, isMain = false }: { user: any, height: string, place: number, delay: number, isMain?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`flex flex-col items-center flex-1 ${isMain ? 'z-10' : 'z-0'}`}
    >
      <div className="relative mb-4">
        <div className={`${isMain ? 'w-24 h-24' : 'w-16 h-16'} rounded-[1.5rem] p-1 bg-gradient-to-br ${place === 1 ? 'from-amber-400 to-amber-700' : place === 2 ? 'from-neutral-300 to-neutral-500' : 'from-orange-400 to-orange-700'} shadow-2xl overflow-hidden`}>
           <ImageWithFallback 
             src={user.avatar} 
             alt={user.name} 
             className="w-full h-full rounded-[1.2rem] object-cover grayscale-[10%]"
           />
        </div>
        <div className={`absolute -bottom-2 -right-2 ${isMain ? 'w-8 h-8' : 'w-6 h-6'} rounded-full bg-black border-2 border-[#3A0310] flex items-center justify-center text-[10px] font-black text-white shadow-xl`}>
          {place}
        </div>
      </div>
      
      <div className="text-center mb-3 min-h-[40px]">
        <p className={`font-black text-white ${isMain ? 'text-sm' : 'text-[10px]'} leading-tight line-clamp-1 mb-0.5`}>{user.name}</p>
        <p className="text-[9px] text-[#E8B4B8] font-bold uppercase tracking-widest">{user.xp} XP</p>
      </div>

      <div className={`w-full ${height} ${isMain ? 'bg-gradient-to-b from-[#3A0310] to-[#1A0107]' : 'bg-white/5'} rounded-t-3xl border-t border-x border-white/10 shadow-2xl relative overflow-hidden`}>
         {isMain && (
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
         )}
         <div className="flex items-center justify-center h-full opacity-20">
            {place === 1 && <Crown className="w-12 h-12 text-amber-500" />}
            {place === 2 && <Medal className="w-8 h-8 text-neutral-400" />}
            {place === 3 && <Medal className="w-8 h-8 text-orange-400" />}
         </div>
      </div>
    </motion.div>
  );
}

export default function RankingsPreview() {
  return (
    <MemoryRouter>
      <Rankings />
    </MemoryRouter>
  );
}
