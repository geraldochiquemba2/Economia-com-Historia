import React, { useState } from "react";
import { useNavigate, MemoryRouter } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  LogOut, 
  Star,
  CheckCircle2,
  Settings,
  Crown,
  History,
  Award
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const imgStudent = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function Profile() {
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : { name: "Estudante", role: "student" };

  const options = [
    { icon: User, label: "Perfil Académico" },
    { icon: Bell, label: "Alertas de Prestígio" },
    { icon: Shield, label: "Segurança de Conta" },
    { icon: HelpCircle, label: "Arquivo de Suporte" },
  ];

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300 md:max-w-5xl md:mx-auto md:px-6">
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative px-6 pt-8 pb-20 md:pb-10 overflow-hidden md:rounded-[2.5rem] md:mt-6 shadow-2xl border border-[#3A0310]/10 dark:border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A0310] via-[#2A020B] to-[#140105]"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3A0310] rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10 flex flex-col md:grid md:grid-cols-12 md:gap-12 md:items-center">
          
          {/* Profile Basic Info Column */}
          <div className="flex flex-col items-center md:items-start md:col-span-5 mb-8 md:mb-0">
            <div className="relative mb-5">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-white/5 p-1.5 backdrop-blur-xl border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.4)] overflow-hidden">
                <ImageWithFallback 
                  src={imgStudent}
                  alt={user.name}
                  className="w-full h-full rounded-[1.5rem] object-cover grayscale-[20%]"
                />
              </div>
              <button className="absolute -bottom-1 -right-1 bg-[#3A0310] force-white p-2 rounded-xl shadow-2xl border border-[#E8B4B8]/20 hover:scale-110 transition-transform active:scale-95">
                <Settings className="w-4 h-4 force-white" />
              </button>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-0.5 text-center md:text-left force-white">{user.name}</h2>
            <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-center md:text-left force-gold">{user.role === 'admin' ? 'Administrador' : 'Académico Ilustre • Nível 4'}</p>
          </div>
          
          {/* Profile Stats Grid Column */}
          <div className="w-full md:col-span-7">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-[#3A0310]/30 backdrop-blur-md border-2 p-3 md:p-4 rounded-2xl flex flex-col items-center shadow-lg transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Star className="w-4 h-4 text-amber-500 mb-1.5 fill-amber-500" />
                <span className="font-black text-base md:text-lg force-white">2.450</span>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest force-gold">XP Total</span>
              </div>
              <div className="bg-[#3A0310]/30 backdrop-blur-md border-2 p-3 md:p-4 rounded-2xl flex flex-col items-center shadow-lg transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <History className="w-4 h-4 force-gold mb-1.5" />
                <span className="font-black text-base md:text-lg force-white">12</span>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest force-gold">Temas</span>
              </div>
              <div className="bg-[#3A0310]/30 backdrop-blur-md border-2 p-3 md:p-4 rounded-2xl flex flex-col items-center shadow-lg transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Award className="w-4 h-4 force-white mb-1.5" />
                <span className="font-black text-base md:text-lg force-white">#4</span>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest force-gold">Ranking</span>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Main Content Area: Responsive Two-column on PC, Single-column on Mobile */}
      <div className="px-6 -mt-8 md:mt-8 relative z-20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 w-full">
        
        {/* Left Column: Plan & Logout */}
        <div className="md:col-span-6 space-y-6 flex flex-col justify-between">
          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[2rem] bg-gradient-to-br from-[#3A0310]/95 via-[#2A020B] to-[#140105] overflow-hidden shadow-2xl group border border-[#E8B4B8]/20 flex-1 flex flex-col justify-center"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#3A0310]"></div>
            
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.div 
                   key="free-plan"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="p-6 md:p-8"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] block mb-1.5 force-gold">
                        Plano Atual
                      </span>
                      <h3 className="text-xl font-black uppercase tracking-tight force-white">Membro Base</h3>
                    </div>
                    <div className="bg-white/10 force-white text-[8px] font-black px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                      Gratuito
                    </div>
                  </div>
                  
                  <p className="text-xs md:text-sm mb-6 leading-relaxed font-medium force-white opacity-90">
                    Desbloqueia o arquivo completo e os círculos de debate exclusivos fazendo upgrade para a elite.
                  </p>
                  
                  <button 
                    onClick={() => setSubscribed(true)}
                    className="w-full bg-[#3A0310] force-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-[#5A051A] transition-all active:scale-[0.98] flex justify-center items-center group/btn border border-[#E8B4B8]/20"
                  >
                    <Crown className="w-4 h-4 mr-2 group-hover/btn:-translate-y-0.5 group-hover/btn:text-amber-500 transition-all force-gold" /> 
                    Ascender à Elite
                  </button>
                </motion.div>
              ) : (
                 <motion.div 
                    key="premium-plan"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative p-6 md:p-8"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3A0310] to-black opacity-40 -z-10 group-hover:scale-110 transition-transform duration-1000"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] block mb-1.5 force-gold">
                          Status de Prestígio
                        </span>
                        <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight force-white">
                          <Crown className="w-5 h-5 text-amber-500 fill-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" /> Membro Elite
                        </h3>
                      </div>
                      <div className="bg-[#3A0310] text-[8px] font-black px-2.5 py-1 rounded-full border border-[#E8B4B8]/30 uppercase tracking-widest force-gold">
                        Vigoroso
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        'Acesso Total ao Arquivo Histórico',
                        'Círculos de Debate Exclusivos',
                        'Suporte Académico Prioritário'
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center text-[10px] font-bold uppercase tracking-tight force-white opacity-90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
                          {feat}
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => setSubscribed(false)}
                      className="w-full bg-white/10 backdrop-blur-md force-white border border-white/20 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white/20 transition-all active:scale-[0.98]"
                    >
                      Gerir Assinatura
                    </button>
                  </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Logout Button */}
          <div className="w-full md:pb-4">
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");
              }}
              className="w-full flex items-center justify-center gap-2.5 py-4 text-[#3A0310] dark:text-[#E8B4B8]/60 font-black uppercase tracking-widest text-[9px] bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Terminar Sessão
            </button>
          </div>
        </div>

        {/* Right Column: Menu Options */}
        <div className="md:col-span-6 space-y-3 w-full">
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] px-2 text-neutral-400 dark:text-neutral-500">Configurações de Arquivo</h3>
          
          <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-neutral-100 dark:border-white/5 overflow-hidden divide-y divide-neutral-100 dark:divide-white/5 shadow-xl">
            {options.map((item, index) => (
              <button 
                key={item.label}
                className="w-full flex items-center justify-between p-4.5 md:p-5 hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-all group active:bg-neutral-100 dark:active:bg-white/[0.05]"
              >
                <div className="flex items-center gap-4 text-neutral-700 dark:text-neutral-300 font-bold uppercase tracking-tighter transition-colors group-hover:text-[#3A0310] dark:group-hover:text-white">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center border border-neutral-200/50 dark:border-white/5 group-hover:bg-[#3A0310]/15 dark:group-hover:bg-[#3A0310]/20 group-hover:border-[#3A0310]/40 transition-all">
                    <item.icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors" />
                  </div>
                  <span className="text-xs md:text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-700 group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ProfilePreview() {
  return (
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}
