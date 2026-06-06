import React, { useState, useEffect } from "react";
import { Link, MemoryRouter, useNavigate } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
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
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const firstName = user ? user.name.split(" ")[0] : "";

  const categories = [
    { id: 1, name: "Macro", icon: TrendingUp },
    { id: 2, name: "História", icon: History },
    { id: 3, name: "Moedas", icon: Coins },
    { id: 4, name: "Impérios", icon: Award },
  ];

  const [featuredThemes, setFeaturedThemes] = useState<any[]>([]);
  const [recommendedThemes, setRecommendedThemes] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeaturedThemes(data.filter(item => item.featured));
          setRecommendedThemes(data.filter(item => item.recommended));
        }
      })
      .catch(err => console.error("Error fetching content:", err));
  }, []);

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
        className="relative overflow-hidden px-6 pt-14 pb-12 md:pt-20 md:pb-16 md:px-10 sticky top-0 md:relative md:top-auto z-50 md:z-10 border-b md:border border-white/5 md:border-white/10 bg-black md:rounded-[2.5rem] md:mt-6 shadow-2xl"
      >
        {/* Background Image of Historical Theme */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1447069387593-a5de0862481e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
            alt="Fundo Temático" 
            className="w-full h-full object-cover opacity-80 scale-105"
          />
          {/* Sepia & light overlay gradient for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3A0310]/40 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] opacity-95" style={{ color: '#E8B4B8' }}>Bem-vindo à</p>
              <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-1.5" style={{ color: '#ffffff' }}>Economia com História</h1>
            </div>
            
            <button className="relative p-3 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/30 transition-all duration-350 border border-white/25 shadow-2xl active:scale-95">
              <Bell className="w-5 h-5" style={{ color: '#ffffff' }} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-[#E8B4B8] rounded-full border border-black shadow-[0_0_8px_#E8B4B8]"></span>
            </button>
          </div>

          {/* Search Bar - Premium Glassmorphism */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
            <input 
              type="text" 
              placeholder="Procurar tesouros de conhecimento..." 
              className="w-full bg-white/15 backdrop-blur-md border border-white/20 placeholder-white/70 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#E8B4B8]/50 focus:bg-white/20 transition-all text-xs font-bold uppercase tracking-widest shadow-2xl force-white force-white-placeholder"
              style={{ color: '#ffffff' }}
            />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="px-6 pt-8 space-y-12">
        
        {/* Personal Greeting or Login Prompt */}
        {token ? (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden p-6 rounded-[2.5rem] bg-white/5 border border-white/5 shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-2.5 h-12 rounded-full bg-gradient-to-b from-[#3A0310] to-[#E8B4B8]" />
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Olá, {firstName}</h2>
                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest mt-1">Pronto para a jornada de hoje?</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#3A0310]/30 text-[#E8B4B8] px-4 py-2 rounded-full border border-[#E8B4B8]/20 text-[9px] font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" fill="currentColor" />
              <span>3 Dias Ativo</span>
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-r from-[#3A0310]/80 to-[#140105] border border-[#E8B4B8]/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-2.5 h-16 rounded-full bg-gradient-to-b from-white to-[#E8B4B8]" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black force-white uppercase tracking-tight mb-1">Inicie a sua Jornada</h2>
                <p className="text-xs force-gold font-bold uppercase tracking-widest max-w-sm">Junte-se a nós para desbloquear todo o conteúdo histórico e debater no fórum.</p>
              </div>
            </div>
            <div className="flex w-full md:w-auto items-center gap-3">
              <Link to="/login" className="flex-1 md:flex-none text-center bg-white/10 hover:bg-white/20 force-white border border-white/20 px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors shadow-lg backdrop-blur-md force-border-white">
                Fazer Login
              </Link>
              <Link to="/register" className="flex-1 md:flex-none text-center bg-white text-[#3A0310] hover:bg-neutral-200 px-6 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors shadow-xl" style={{ color: '#3A0310' }}>
                Cadastrar
              </Link>
            </div>
          </motion.section>
        )}

        {/* Featured Themes */}
        {featuredThemes.length > 0 && (
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
          
          <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6">
            {featuredThemes.map((theme, index) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex-shrink-0 w-[85vw] max-w-[340px] group"
              >
                <Link 
                  to={`/app/explore/${theme.id}`} 
                  onClick={(e) => {
                    if (theme.type === 'jindungo') {
                      const userStr = localStorage.getItem('user');
                      if (!userStr) {
                        e.preventDefault();
                        toast?.error('Acesso Restrito', { description: 'Faça login para ter acesso ao conteúdo jindungo.' });
                        navigate('/app/explore?filter=jindungo');
                      } else {
                        const user = JSON.parse(userStr);
                        if (user.role !== 'elite' && user.role !== 'admin') {
                          e.preventDefault();
                          toast?.error('Acesso Bloqueado', { description: 'Você precisa ser membro elite para ler este conteúdo.' });
                          navigate('/app/explore?filter=jindungo');
                        }
                      }
                    }
                  }}
                  className="block relative h-96 rounded-[2.5rem] overflow-hidden border border-white/10 group-hover:border-[#3A0310]/50 transition-all duration-500 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]"
                >
                  <ImageWithFallback 
                    src={theme.thumbnail || imgCoins}
                    alt={theme.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-[#3A0310] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#E8B4B8]/20 shadow-2xl" style={{ color: '#E8B4B8' }}>
                        {({ jindungo: "Texto com Jindungo 🔥", text: "Texto", video: "Vídeo", podcast: "Áudio" }[theme.type] || theme.type)}
                      </span>
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <Gem className="w-3 h-3" style={{ color: '#ffffff' }} />
                      </div>
                    </div>
                    <h3 className="font-black text-2xl leading-tight mb-3 drop-shadow-2xl uppercase tracking-tighter" style={{ color: '#ffffff' }}>
                      {theme.title}
                    </h3>
                    <p className="text-sm font-medium line-clamp-2 mb-6" style={{ color: '#e5e5e5' }}>
                      {theme.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-black/40 rounded-md border border-white/10" style={{ color: '#a3a3a3' }}>Ver Discussões</span>
                      </div>
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-[#3A0310] group-hover:border-[#E8B4B8]/30 transition-all duration-300 shadow-2xl">
                        <Play className="w-4 h-4 ml-0.5" fill="currentColor" style={{ color: '#ffffff' }} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
        )}

        {/* Quick Categories */}
        <section>
          <div className="grid grid-cols-4 gap-4 md:gap-8 md:max-w-3xl md:mx-auto">
            {categories.map((cat, idx) => (
              <Link 
                key={cat.id} 
                to="/app/explore" 
                className="flex flex-col items-center gap-3 group"
              >
                <motion.div 
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-white/5 border border-[#3A0310]/30 dark:border-[#3A0310]/50 flex items-center justify-center group-hover:bg-[#3A0310]/10 dark:group-hover:bg-[#3A0310]/20 group-hover:border-[#3A0310]/80 transition-all duration-300 shadow-xl"
                >
                  <cat.icon className="w-6 h-6 text-[#3A0310] dark:text-[#E8B4B8] group-hover:scale-110 transition-transform" />
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
                <div className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-black/60">
                  <Trophy className="w-7 h-7" style={{ color: '#E8B4B8' }} />
                </div>
                <div>
                  <h4 className="font-black text-xl uppercase tracking-tighter" style={{ color: '#ffffff' }}>Ranking de Elite</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1 italic" style={{ color: 'rgba(232, 180, 184, 0.8)' }}>Vê a tua posição no Panteão</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                <ChevronRight className="w-5 h-5" style={{ color: '#ffffff' }} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: '#E8B4B8' }}>Junta-te aos líderes do conhecimento</span>
            </div>
          </Link>
        </section>

        {/* Recommended List */}
        {recommendedThemes.length > 0 && (
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
            
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6">
              {recommendedThemes.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
                className="flex-shrink-0 w-[85vw] max-w-[340px]"
              >
                <Link 
                  to={`/app/explore/${rec.id}`}
                  onClick={(e) => {
                    if (rec.type === 'jindungo') {
                      const userStr = localStorage.getItem('user');
                      if (!userStr) {
                        e.preventDefault();
                        toast?.error('Acesso Restrito', { description: 'Faça login para ter acesso ao conteúdo jindungo.' });
                        navigate('/app/explore?filter=jindungo');
                      } else {
                        const user = JSON.parse(userStr);
                        if (user.role !== 'elite' && user.role !== 'admin') {
                          e.preventDefault();
                          toast?.error('Acesso Bloqueado', { description: 'Você precisa ser membro elite para ler este conteúdo.' });
                          navigate('/app/explore?filter=jindungo');
                        }
                      }
                    }
                  }}
                  className="flex bg-white dark:bg-white/5 rounded-[2rem] p-4 border-2 border-[#3A0310] dark:border-white/10 hover:bg-[#3A0310]/5 dark:hover:bg-white/10 hover:border-[#5A051A] dark:hover:border-[#E8B4B8]/80 transition-all duration-300 group shadow-lg overflow-hidden relative"
                >
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-[#3A0310]/20 dark:border-white/10 shadow-xl">
                    <ImageWithFallback 
                      src={rec.thumbnail || imgMarket} 
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-center ml-5 flex-1">
                    <span className="text-[9px] font-black text-[#E8B4B8] uppercase tracking-[0.2em] mb-1 block">
                      {({ jindungo: "Texto com Jindungo 🔥", text: "Texto", video: "Vídeo", podcast: "Áudio" }[rec.type] || rec.type)}
                    </span>
                    <h3 className="text-[#3A0310] dark:text-white font-black text-sm leading-tight group-hover:text-[#5A051A] dark:group-hover:text-[#E8B4B8] transition-colors line-clamp-2 uppercase tracking-tight">
                      {rec.title}
                    </h3>
                    
                     <div className="mt-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3A0310] dark:bg-[#E8B4B8]" />
                        <span className="text-[8px] font-black text-[#3A0310] dark:text-[#E8B4B8] uppercase tracking-widest">Aceder ao Arquivo</span>
                     </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
        )}
        
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
