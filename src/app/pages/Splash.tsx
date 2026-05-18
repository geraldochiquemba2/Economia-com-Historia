import React from "react";
import { useNavigate, MemoryRouter } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Users, TrendingUp, Sparkles, Quote } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Unsplash images for the Dark Wealth aesthetic
const imgCoins = "https://images.unsplash.com/photo-1589180176337-503fed4bcfe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgLibrary = "https://images.unsplash.com/photo-1472173148041-00294f0814a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgVelvet = "https://images.unsplash.com/photo-1528459105426-b9548367069b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgAbstract = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col font-sans w-full max-w-md mx-auto shadow-2xl relative overflow-x-hidden text-white selection:bg-[#3A0310] selection:text-white">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[750px] w-full flex flex-col justify-end pb-16 px-8">
        {/* Background Image with sophisticated overlays */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <ImageWithFallback
            src={imgCoins}
            alt="Moedas históricas douradas"
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          {/* Multi-layered gradients for Dark Wealth feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#3A0310]/40 to-[#0F0F0F]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-[#E8B4B8]/20 rounded-full bg-black/40 backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-[#E8B4B8]" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#E8B4B8]">
                Plataforma Educativa
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-light mb-6 leading-[1.1] tracking-tight">
              <span className="opacity-80">Economia com</span><br/>
              <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8B4B8] via-[#F2D1D4] to-[#E8B4B8] drop-shadow-sm italic">
                História
              </span>
            </h1>
            
            <p className="text-lg text-neutral-300 mb-10 font-medium leading-relaxed max-w-[280px]">
              Aprenda os fundamentos da economia através de uma perspetiva histórica, cultural e africana.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 w-full"
          >
            <button 
              onClick={() => navigate("/app")}
              className="group relative w-full py-5 px-8 bg-[#3A0310] overflow-hidden rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_20px_50px_rgba(58,3,16,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative">Começar agora</span>
              <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate("/app")}
              className="w-full py-5 px-8 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl font-bold text-lg flex items-center justify-center hover:bg-white/10 transition-all active:scale-[0.98]"
            >
              Já tenho conta
            </button>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="bg-[#0F0F0F] px-8 py-24 w-full relative z-20">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-3">
             <div className="w-8 h-[1px] bg-[#3A0310]" />
             <span className="text-[10px] font-black text-[#E8B4B8] uppercase tracking-[0.2em]">Visão Estratégica</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            Para quem procura entender o mundo
          </h2>
          <p className="text-neutral-400 text-lg font-medium leading-relaxed">
            Conteúdos desenhados para conectar o passado ao nosso futuro económico e social.
          </p>
        </motion.div>

        <div className="space-y-6">
          <FeatureCard 
            icon={<BookOpen className="w-6 h-6 text-[#E8B4B8]" />}
            title="Lições Interativas"
            description="Módulos de aprendizagem com casos de estudo reais e contexto histórico."
            bgImage={imgLibrary}
            delay={0.1}
            tag="Lições"
          />
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-[#E8B4B8]" />}
            title="Literacia Financeira"
            description="Aplique conceitos económicos na sua vida pessoal e desenvolvimento."
            bgImage={imgAbstract}
            delay={0.2}
            tag="Finanças"
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-[#E8B4B8]" />}
            title="Comunidade Ativa"
            description="Debata ideias e crie networking com outros estudantes e profissionais."
            bgImage={imgVelvet}
            delay={0.3}
            tag="Comunidade"
          />
        </div>
      </section>

      {/* Quote Section with Glassmorphism */}
      <section className="w-full px-8 py-20 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
        <div className="absolute inset-0">
          <ImageWithFallback 
            src={imgLibrary} 
            alt="Profissionais em debate"
            className="w-full h-full object-cover opacity-30 grayscale scale-110"
          />
          <div className="absolute inset-0 bg-[#3A0310]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F] via-transparent to-[#0F0F0F]" />
        </div>
        
        <div className="absolute top-10 left-10 z-10">
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Profissionais em debate</span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center max-w-sm"
        >
          <div className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 mb-10 mx-auto shadow-2xl">
            <Quote className="w-6 h-6 text-[#E8B4B8]" fill="currentColor" />
          </div>
          
          <h3 className="text-white text-3xl font-light italic leading-relaxed mb-8 drop-shadow-2xl">
            "A educação é a arma mais poderosa que podes usar para mudar o mundo."
          </h3>
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-[2px] bg-[#E8B4B8] mb-2" />
            <p className="text-[#E8B4B8] font-black uppercase tracking-[0.3em] text-xs">
              Nelson Mandela
            </p>
          </div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="relative px-8 py-28 text-center bg-[#0F0F0F]">
        {/* Subtle decorative gold coins in background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3A0310] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E8B4B8] rounded-full blur-[120px] opacity-10" />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Pronto para a sua jornada?</h2>
          <p className="text-neutral-400 mb-12 text-lg leading-relaxed max-w-xs mx-auto">
            Junte-se a milhares de estudantes e comece a transformar o seu futuro hoje com a sabedoria da história.
          </p>
          
          <button 
            onClick={() => navigate("/app")}
            className="w-full py-5 px-8 bg-white text-black rounded-2xl font-black text-lg flex items-center justify-center hover:bg-neutral-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]"
          >
            Criar conta gratuita
          </button>
          
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F0F0F] bg-neutral-800 shadow-xl overflow-hidden ring-1 ring-white/5">
                  <ImageWithFallback 
                    src={`https://i.pravatar.cc/100?u=${i}`} 
                    alt="Aluno" 
                    className="w-full h-full object-cover grayscale"
                  />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#0F0F0F] bg-[#3A0310] flex items-center justify-center text-[10px] font-black text-white shadow-xl ring-1 ring-white/5">
                +12k
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E8B4B8]">
              +12.400 alunos ativos
            </span>
          </div>
        </motion.div>
      </section>
      
      {/* Decorative side grain/texture */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
}

function FeatureCard({ icon, title, description, bgImage, delay, tag }: { icon: React.ReactNode, title: string, description: string, bgImage: string, delay: number, tag: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/5 flex gap-5 items-start p-8 transition-all hover:border-[#3A0310]/50"
    >
      {/* Background glass effect */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-2xl transition-all group-hover:bg-white/10" />
      
      {/* Subtle image under glass */}
      <div className="absolute inset-0 opacity-[0.05] grayscale group-hover:opacity-[0.15] transition-opacity duration-700">
        <img src={bgImage} className="w-full h-full object-cover" alt="" />
      </div>

      <div className="relative z-10 p-3.5 bg-black/40 rounded-2xl shrink-0 border border-white/10 group-hover:bg-[#3A0310]/40 group-hover:border-[#E8B4B8]/20 transition-all duration-500 shadow-xl">
        {icon}
      </div>
      
      <div className="relative z-10">
        <span className="text-[9px] font-black text-[#E8B4B8]/40 uppercase tracking-[0.3em] mb-1 block">{tag}</span>
        <h3 className="font-bold text-white mb-2 text-xl tracking-tight">{title}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors font-medium">{description}</p>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-[#3A0310] w-0 group-hover:w-full transition-all duration-700" />
    </motion.div>
  );
}

export default function SplashPreview() {
  return (
    <MemoryRouter>
      <Splash />
    </MemoryRouter>
  );
}
