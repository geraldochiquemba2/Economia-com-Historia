import React from "react";
import { Link, MemoryRouter } from "react-router";
import { motion } from "motion/react";
import { 
  Bell, 
  Search, 
  Play, 
  TrendingUp, 
  ChevronRight,
  Flame,
  Award,
  History,
  Coins,
  Gem,
  Trophy,
  Sparkles
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// Unsplash images for catchy content
const imgCoins = "https://images.unsplash.com/photo-1589180176337-503fed4bcfe0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgIndustrial = "https://images.unsplash.com/photo-1576666735065-b24beb27b939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgMarket = "https://images.unsplash.com/photo-1558907530-83566904e778?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgLuxury = "https://images.unsplash.com/photo-1528459105426-b9548367069b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgProfile = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function Home() {
  const categories = [
    { id: 1, name: "Macro", icon: TrendingUp },
    { id: 2, name: "História", icon: History },
    { id: 3, name: "Moedas", icon: Coins },
    { id: 4, name: "Impérios", icon: Award },
  ];

  const featuredThemes = [
    {
      id: "theme1",
      title: "Ouro e Impérios: A Moeda que Uniu Continentes",
      subtitle: "Descubra como o ouro moldou as rotas comerciais africanas.",
      image: imgCoins,
      tag: "História",
      link: "/app/explore/1"
    },
    {
      id: "theme2",
      title: "Revolução Industrial: O Motor da Economia Moderna",
      subtitle: "Do vapor à inteligência artificial.",
      image: imgIndustrial,
      tag: "Evolução",
      link: "/app/explore/2"
    }
  ];

  return (
    <div className="bg-[#0F0F0F] min-h-screen pb-24 text-neutral-100 overflow-x-hidden selection:bg-[#3A0310] selection:text-white">
      {/* Decorative background elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-[#3A0310] rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-[#E8B4B8] rounded-full blur-[150px] opacity-5 pointer-events-none" />

      {/* Header / Top Bar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-6 pt-10 pb-6 bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link to="/app/profile" className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#3A0310] to-[#E8B4B8] rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 p-0.5 bg-black">
                <ImageWithFallback 
                  src={imgProfile} 
                  alt="Avatar" 
                  className="w-full h-full rounded-xl object-cover grayscale-[20%]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#3A0310] w-5 h-5 rounded-lg border-2 border-[#0F0F0F] flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-[#E8B4B8]" />
              </div>
            </Link>
            <div>
              <p className="text-[9px] text-[#E8B4B8] font-black uppercase tracking-[0.25em]">Círculo de Prestígio</p>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">Olá, Marcos</h1>
            </div>
          </div>
          
          <button className="relative p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10 shadow-2xl">
            <Bell className="w-5 h-5 text-neutral-300" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-[#3A0310] rounded-full border border-white/20"></span>
          </button>
        </div>

        {/* Search Bar - Glassmorphism */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-neutral-500" />
          </div>
          <input 
            type="text" 
            placeholder="Procurar tesouros de conhecimento..." 
            className="w-full bg-white/5 border border-white/10 text-white placeholder-neutral-500 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#3A0310]/50 transition-all text-xs font-bold uppercase tracking-widest"
          />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 pt-8 space-y-12">
        
        {/* Featured Themes */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-[#E8B4B8]" />
                <span className="text-[10px] font-black text-[#E8B4B8] uppercase tracking-[0.3em]">Em Destaque</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Temas em Destaque</h2>
            </div>
          </div>
          
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {featuredThemes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex-shrink-0 w-[85vw] max-w-[340px] group"
              >
                <Link to={theme.link} className="block relative h-96 rounded-[2.5rem] overflow-hidden border border-white/10 group-hover:border-[#3A0310]/50 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
                  <ImageWithFallback 
                    src={theme.image}
                    alt={theme.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-[#3A0310] text-[#E8B4B8] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#E8B4B8]/20 shadow-2xl">
                        {theme.tag}
                      </span>
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <Gem className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <h3 className="text-white font-black text-2xl leading-tight mb-3 drop-shadow-2xl uppercase tracking-tighter">
                      {theme.title}
                    </h3>
                    <p className="text-neutral-300 text-sm font-medium line-clamp-2 mb-6">
                      {theme.subtitle}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-7 h-7 rounded-full border-2 border-black bg-neutral-800 shadow-xl overflow-hidden">
                              <ImageWithFallback src={`https://i.pravatar.cc/50?u=${i}`} className="w-full h-full object-cover grayscale" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[9px] text-neutral-400 font-black uppercase tracking-widest">+1.2k Alunos</span>
                      </div>
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-[#3A0310] group-hover:border-[#E8B4B8]/30 transition-all duration-300 shadow-2xl">
                        <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Categories */}
        <section>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <Link 
                key={cat.id} 
                to="/app/explore" 
                className="flex flex-col items-center gap-3 group"
              >
                <motion.div 
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#3A0310]/20 group-hover:border-[#3A0310]/50 transition-all duration-300 shadow-2xl"
                >
                  <cat.icon className="w-6 h-6 text-[#E8B4B8] group-hover:scale-110 transition-transform" />
                </motion.div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest text-center group-hover:text-white transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Rankings Teaser - NEW */}
        <section>
           <Link 
            to="/app/rankings"
            className="block relative p-6 rounded-[2.5rem] bg-gradient-to-br from-[#3A0310]/80 to-[#1A0107] border border-[#E8B4B8]/30 overflow-hidden group shadow-[0_20px_50px_rgba(58,3,16,0.5)]"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E8B4B8] rounded-full blur-[80px] opacity-10" />
            <div className="absolute inset-0 opacity-10 grayscale group-hover:scale-110 transition-transform duration-[3s]">
              <ImageWithFallback src={imgLuxury} className="w-full h-full object-cover" />
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl group-hover:bg-[#E8B4B8] transition-colors duration-500">
                  <Trophy className="w-7 h-7 text-[#E8B4B8] group-hover:text-[#3A0310] transition-colors" />
                </div>
                <div>
                  <h4 className="text-white font-black text-xl uppercase tracking-tighter">Ranking de Elite</h4>
                  <p className="text-[#E8B4B8]/70 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Vê a tua posição no Panteão</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-3">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-[#3A0310] bg-neutral-800 shadow-xl overflow-hidden ring-1 ring-white/10">
                     <ImageWithFallback src={`https://i.pravatar.cc/100?u=user${i}`} className="w-full h-full object-cover grayscale" />
                   </div>
                 ))}
              </div>
              <span className="text-[9px] font-black text-[#E8B4B8] uppercase tracking-[0.2em]">Ana, João e +1.2k Ativos</span>
            </div>
          </Link>
        </section>

        {/* Recommended List */}
        <section className="pb-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#E8B4B8]" />
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Arquivos Recomendados</h2>
            </div>
            <Link to="/app/explore" className="text-[10px] font-black text-[#E8B4B8] uppercase tracking-widest flex items-center gap-1 group">
              Explorar <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-5">
            {[
              { id: 1, title: "Mercados Africanos: Do Escambo ao Digital", category: "Economia Real", image: imgMarket },
              { id: 2, title: "A Arte de Escrever a Economia", category: "Literatura", image: "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
              { id: 3, title: "Cidades do Futuro: Economia Urbana", category: "Atualidade", image: "https://images.unsplash.com/photo-1502228362178-086346ac6862?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" }
            ].map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
              >
                <Link 
                  to="/app/explore"
                  className="flex bg-white/5 rounded-[2rem] p-4 border border-white/5 hover:bg-white/10 hover:border-[#3A0310]/30 transition-all duration-300 group shadow-2xl overflow-hidden relative"
                >
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-xl">
                    <ImageWithFallback 
                      src={rec.image} 
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors"></div>
                  </div>
                  
                  <div className="flex flex-col justify-center ml-5 flex-1">
                    <span className="text-[9px] font-black text-[#E8B4B8] uppercase tracking-[0.25em] mb-2 block">
                      {rec.category}
                    </span>
                    <h3 className="text-white font-bold text-base leading-tight group-hover:text-[#E8B4B8] transition-colors line-clamp-2 uppercase tracking-tight">
                      {rec.title}
                    </h3>
                    
                    <div className="mt-3 flex items-center gap-1.5 opacity-50">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#E8B4B8]" />
                       <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Aceder ao Arquivo</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
        
      </main>
    </div>
  );
}

export default function HomePreview() {
  return (
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}
