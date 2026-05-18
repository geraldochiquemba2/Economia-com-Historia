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
import imgStudent from "../../imports/image-4.png";

export function Profile() {
  const navigate = useNavigate();
  const [subscribed, setSubscribed] = useState(false);

  const options = [
    { icon: User, label: "Perfil Académico" },
    { icon: Bell, label: "Alertas de Prestígio" },
    { icon: Shield, label: "Segurança de Conta" },
    { icon: HelpCircle, label: "Arquivo de Suporte" },
  ];

  return (
    <div className="bg-[#0F0F0F] min-h-screen pb-24 text-neutral-100">
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative px-6 pt-12 pb-32 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A0310] via-[#0F0F0F] to-[#0F0F0F]"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3A0310] rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 p-1.5 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
              <ImageWithFallback 
                src={imgStudent}
                alt="Marcos Silva"
                className="w-full h-full rounded-[2rem] object-cover grayscale-[20%]"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-[#3A0310] text-[#E8B4B8] p-2.5 rounded-2xl shadow-2xl border border-[#E8B4B8]/20 hover:scale-110 transition-transform active:scale-95">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1">Marcos Silva</h2>
          <p className="text-[#E8B4B8] font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Académico Ilustre • Nível 4</p>
          
          <div className="flex gap-4 w-full">
            <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 p-4 rounded-3xl flex flex-col items-center">
              <Star className="w-5 h-5 text-amber-500 mb-2 fill-amber-500" />
              <span className="text-white font-black text-lg">2.450</span>
              <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">XP Total</span>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 p-4 rounded-3xl flex flex-col items-center">
              <History className="w-5 h-5 text-[#E8B4B8] mb-2" />
              <span className="text-white font-black text-lg">12</span>
              <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">Temas</span>
            </div>
            <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/5 p-4 rounded-3xl flex flex-col items-center">
              <Award className="w-5 h-5 text-neutral-300 mb-2" />
              <span className="text-white font-black text-lg">#4</span>
              <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">Ranking</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="px-6 -mt-12 relative z-20 space-y-8">
        
        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-2xl group"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#3A0310]"></div>
          
          <AnimatePresence mode="wait">
            {!subscribed ? (
              <motion.div 
                key="free-plan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-[#E8B4B8] uppercase tracking-[0.2em] block mb-2">
                      Plano Atual
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Membro Base</h3>
                  </div>
                  <div className="bg-white/5 text-neutral-400 text-[9px] font-black px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest">
                    Gratuito
                  </div>
                </div>
                
                <p className="text-neutral-400 text-sm mb-8 leading-relaxed font-medium">
                  Desbloqueia o arquivo completo e os círculos de debate exclusivos fazendo upgrade para a elite.
                </p>
                
                <button 
                  onClick={() => setSubscribed(true)}
                  className="w-full bg-[#3A0310] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-[#5A051A] transition-all active:scale-[0.98] flex justify-center items-center group/btn border border-[#E8B4B8]/20"
                >
                  <Crown className="w-5 h-5 mr-3 group-hover/btn:-translate-y-1 group-hover/btn:text-amber-500 transition-all" /> 
                  Ascender à Elite
                </button>
              </motion.div>
            ) : (
               <motion.div 
                 key="premium-plan"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="relative p-8"
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-[#3A0310] to-black opacity-40 -z-10 group-hover:scale-110 transition-transform duration-1000"></div>
                 
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <span className="text-[10px] font-black text-[#E8B4B8] uppercase tracking-[0.2em] block mb-2">
                       Status de Prestígio
                     </span>
                     <h3 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                       <Crown className="w-6 h-6 text-amber-500 fill-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" /> Membro Elite
                     </h3>
                   </div>
                   <div className="bg-[#3A0310] text-[#E8B4B8] text-[9px] font-black px-3 py-1.5 rounded-full border border-[#E8B4B8]/30 uppercase tracking-widest">
                     Vigoroso
                   </div>
                 </div>
                 
                 <div className="space-y-4 mb-8">
                   {[
                     'Acesso Total ao Arquivo Histórico',
                     'Círculos de Debate Exclusivos',
                     'Suporte Académico Prioritário'
                   ].map((feat, i) => (
                     <div key={i} className="flex items-center text-xs text-neutral-300 font-bold uppercase tracking-tight">
                       <CheckCircle2 className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                       {feat}
                     </div>
                   ))}
                 </div>
                 
                 <button 
                   onClick={() => setSubscribed(false)}
                   className="w-full bg-white/5 backdrop-blur-md text-white border border-white/20 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-white/10 transition-all active:scale-[0.98]"
                 >
                   Gerir Assinatura
                 </button>
               </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Account Options */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] px-2">Configurações de Arquivo</h3>
          
          <div className="bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden divide-y divide-white/5 shadow-2xl">
            {options.map((item, index) => (
              <button 
                key={item.label}
                className="w-full flex items-center justify-between p-6 hover:bg-white/[0.03] transition-all group active:bg-white/[0.05]"
              >
                <div className="flex items-center gap-5 text-neutral-300 font-bold uppercase tracking-tighter transition-colors group-hover:text-white">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-[#3A0310]/20 group-hover:border-[#3A0310]/40 transition-all">
                    <item.icon className="w-5 h-5 text-neutral-500 group-hover:text-[#E8B4B8] transition-colors" />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-700 group-hover:text-[#E8B4B8] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4 pb-12">
          <button 
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-3 py-5 text-[#E8B4B8]/60 font-black uppercase tracking-widest text-[10px] bg-white/5 border border-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 rounded-2xl transition-all active:scale-[0.98] shadow-2xl"
          >
            <LogOut className="w-4 h-4" />
            Terminar Sessão
          </button>
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
