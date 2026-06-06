import React, { useState } from "react";
import { Link, MemoryRouter, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, CheckCircle, XCircle, ChevronRight, Medal, Flame, Award, ArrowLeft, Swords } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const imgWinner = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgSecond = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const imgThird = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | "play" | "result" | "ranking">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);

  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userRankData = currentUser ? rankings.find((r: any) => r.id === currentUser.id) : null;
  const userXP = userRankData?.xp || 0;
  
  let nivel = "Iniciante";
  if (userXP >= 500) nivel = "Académico";
  if (userXP >= 1500) nivel = "Membro de Elite";
  if (userXP >= 3000) nivel = "Elite Imperial";
  if (userXP >= 5000) nivel = "Lenda Histórica";

  React.useEffect(() => {
    fetch('/api/quiz').then(res => res.json()).then(data => setQuestions(data)).catch(console.error);
    fetch('/api/rankings').then(res => res.json()).then(data => setRankings(data)).catch(console.error);
  }, []);

  const handleStart = () => {
    if (!currentUser) {
      toast.error("Inicie sessão para jogar e guardar os seus pontos!");
      navigate('/login');
      return;
    }
    setStep("play");
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleSelect = (idx: number) => {
    if (showFeedback || questions.length === 0) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (idx === questions[currentQuestion].correctAnswer) {
      setScore(s => s + (questions[currentQuestion].points || 10));
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setStep("result");
      const token = localStorage.getItem("token");
      if (token && score > 0) {
        try {
          await fetch("/api/quiz/score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ points: score })
          });
          // Refresh rankings after playing
          const res = await fetch("/api/rankings");
          const data = await res.json();
          setRankings(data);
        } catch(e) { console.error(e); }
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 flex flex-col items-center justify-start transition-colors duration-300">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md md:max-w-5xl px-6 py-6 min-h-[80vh] flex flex-col items-center justify-start"
          >
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
              
              {/* Left Column - Challenge details */}
              <div className="md:col-span-6 flex flex-col items-center md:items-start justify-start text-center md:text-left h-full md:pt-2">
                <div className="relative w-full aspect-[2.4/1] rounded-[2rem] overflow-hidden border-2 border-[#3A0310] mb-4 shadow-xl">
                  <div className="absolute inset-0 opacity-40 grayscale brightness-[0.7] contrast-125">
                    <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1586974710160-55f48f417990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                      alt="Coins and History"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3A0310] via-transparent to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                      <Trophy className="w-7 h-7 text-[#E8B4B8]" />
                    </div>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black mb-1.5 tracking-tighter uppercase text-neutral-800 dark:text-white leading-tight">
                  Duelo de <span className="text-[#3A0310] dark:text-[#E8B4B8]">Prestígio</span>
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mb-4 max-w-[340px] md:max-w-md leading-relaxed text-xs md:text-sm font-semibold">
                  Demonstra o teu domínio sobre a economia histórica e ascende na hierarquia global.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  <button
                    onClick={handleStart}
                    className="w-full py-4 bg-[#3A0310] force-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5A051A] transition-all border border-[#E8B4B8]/20 flex justify-center items-center gap-2 shadow-2xl active:scale-[0.98]"
                  >
                    <Swords className="w-4 h-4 force-gold" />
                    Começar Desafio
                  </button>
                  <button
                    onClick={() => setStep("ranking")}
                    className="w-full py-4 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-white/10 transition-all shadow-sm"
                  >
                    Ver Ranking Global
                  </button>
                </div>
                
                <Link to="/app" className="mt-4 flex items-center justify-center md:justify-start gap-1.5 text-neutral-500 hover:text-[#3A0310] dark:hover:text-[#E8B4B8] font-black uppercase tracking-widest text-[9px] transition-colors w-full md:w-auto">
                  <ArrowLeft className="w-3 h-3" /> Voltar ao Início
                </Link>
              </div>

              {/* Right Column - Duelist Stats & Weekly Challenges (Only visible on PC) */}
              <div className="md:col-span-6 hidden md:flex flex-col gap-8 w-full border-l border-neutral-200 dark:border-white/10 pl-12">
                {currentUser ? (
                  <>
                    <div>
                      <span className="text-[10px] font-black text-[#3A0310] dark:text-[#E8B4B8] uppercase tracking-[0.2em]">O teu perfil de duelista</span>
                      <h2 className="text-3xl font-black text-neutral-800 dark:text-white uppercase tracking-tight mt-1">Academia e Glória</h2>
                    </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-white/10 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm hover:bg-[#3A0310]/5 transition-all">
                    <div className="p-3 bg-[#3A0310]/5 dark:bg-[#3A0310]/30 rounded-xl">
                      <Trophy className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
                    </div>
                    <div>
                      <span className="block text-[8px] text-neutral-400 font-black uppercase tracking-widest mb-0.5">Nível Académico</span>
                      <span className="text-xs font-black text-neutral-800 dark:text-[#E8B4B8] uppercase tracking-tight">{nivel}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-white/10 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm hover:bg-[#3A0310]/5 transition-all">
                    <div className="p-3 bg-[#3A0310]/5 dark:bg-[#3A0310]/30 rounded-xl">
                      <Medal className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
                    </div>
                    <div>
                      <span className="block text-[8px] text-neutral-400 font-black uppercase tracking-widest mb-0.5">Prestígio Total</span>
                      <span className="text-xs font-black text-neutral-800 dark:text-white uppercase tracking-tight">{userXP} XP</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-white/10 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm hover:bg-[#3A0310]/5 transition-all">
                    <div className="p-3 bg-[#3A0310]/5 dark:bg-[#3A0310]/30 rounded-xl">
                      <Award className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
                    </div>
                    <div>
                      <span className="block text-[8px] text-neutral-400 font-black uppercase tracking-widest mb-0.5">Precisão Geral</span>
                      <span className="text-xs font-black text-neutral-800 dark:text-white uppercase tracking-tight">{Math.min(100, Math.max(0, Math.floor((userXP / 5000) * 100)) + 40)}% Acertos</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-white/10 rounded-[1.5rem] p-5 flex items-center gap-4 shadow-sm hover:bg-[#3A0310]/5 transition-all">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                      <Flame className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <span className="block text-[8px] text-neutral-400 font-black uppercase tracking-widest mb-0.5">Sequência Ativa</span>
                      <span className="text-xs font-black text-neutral-800 dark:text-white uppercase tracking-tight">{Math.max(0, Math.floor(userXP / 200))} Dias 🔥</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">Missões Semanais de Prestígio</span>
                  
                  <div className="bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-white/10 rounded-[2rem] p-5 relative overflow-hidden group hover:border-[#3A0310]/80 transition-all shadow-sm">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3A0310]" />
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-black text-xs text-neutral-800 dark:text-white uppercase tracking-tight">Rota do Café e Açúcar</h4>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Acerta 5 questões sobre trocas coloniais africanas</p>
                      </div>
                      <span className="text-[9px] font-black text-[#3A0310] dark:text-[#E8B4B8] bg-white dark:bg-white/5 border border-[#E8B4B8]/20 px-2 py-0.5 rounded-md shadow-sm">+250 XP</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                      <div className="bg-[#3A0310] dark:bg-[#E8B4B8] h-full rounded-full transition-all duration-1000" style={{ width: '60%' }} />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Progresso da Missão</span>
                      <span className="text-[8px] font-black text-neutral-600 dark:text-neutral-300">3 / 5 Concluídas</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 border border-neutral-100 dark:border-white/5 opacity-50 rounded-[2rem] p-5 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">O Valor da Moeda Real</h4>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-600 font-medium">Alcança pontuação máxima num duelo de inflação</p>
                      </div>
                      <span className="text-[9px] font-black text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-neutral-200 dark:border-white/10">Bloqueado</span>
                    </div>
                  </div>
                </div>
                </>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-neutral-50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 shadow-sm">
                    <div className="w-16 h-16 bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10 rounded-2xl flex items-center justify-center mb-4">
                      <Trophy className="w-8 h-8 text-[#3A0310] dark:text-[#E8B4B8]" />
                    </div>
                    <h3 className="text-xl font-black text-neutral-800 dark:text-white uppercase tracking-tight mb-2">Desperta a Tua Lenda</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mb-8 leading-relaxed max-w-sm">Faz login ou cria uma conta para guardares os teus pontos de prestígio, subires no ranking global e ganhares insígnias exclusivas.</p>
                    <div className="flex gap-3 w-full justify-center">
                      <Link to="/login" className="px-6 py-3 bg-[#3A0310] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#5A051A] transition-all shadow-md">
                        Entrar na Conta
                      </Link>
                      <Link to="/register" className="px-6 py-3 bg-white dark:bg-white/10 text-neutral-800 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-white/20 transition-all border border-neutral-200 dark:border-white/10 shadow-sm">
                        Registar
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {step === "play" && (
          <motion.div
            key="play"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md md:max-w-5xl flex flex-col h-full pt-2 px-6"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3A0310] dark:text-[#E8B4B8]">Questão {currentQuestion + 1} / {questions.length || 0}</span>
                <div className="flex gap-1.5 mt-2">
                  {questions.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= currentQuestion ? 'w-6 bg-[#3A0310]' : 'w-2 bg-neutral-200 dark:bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <div className="bg-neutral-100 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-neutral-200 dark:border-white/10 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" />
                <span className="font-black text-neutral-800 dark:text-white">{score}</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-2">
              {/* Left Column: Question Card & Historical Feedback */}
              <div className="md:col-span-6 flex flex-col gap-4">
                <div className="bg-gradient-to-br from-[#3A0310] to-[#1A0107] dark:bg-gradient-to-br dark:from-[#3A0310]/80 dark:to-[#1A0107] rounded-[1.5rem] border-2 border-[#E8B4B8]/30 p-5 md:p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-15 grayscale brightness-[0.6] mix-blend-overlay pointer-events-none">
                    <ImageWithFallback src="https://images.unsplash.com/photo-1586974710160-55f48f417990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3A0310]/40 via-transparent to-transparent pointer-events-none"></div>
                  
                  <h2 className="relative z-10 text-lg md:text-xl font-black leading-tight uppercase tracking-tight" style={{ color: '#ffffff' }}>
                    {questions.length > 0 ? questions[currentQuestion].question : "A carregar..."}
                  </h2>
                </div>

                <AnimatePresence>
                  {showFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-[#3A0310]/5 dark:bg-[#3A0310]/10 border border-[#3A0310]/20 dark:border-[#3A0310]/30 rounded-[1.5rem] text-xs font-medium relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3A0310]"></div>
                      <p className="text-[#3A0310] dark:text-[#E8B4B8] font-black uppercase text-[9px] tracking-widest mb-1.5">Sabedoria Histórica</p>
                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed italic">"{questions[currentQuestion].feedback}"</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Interactive Options & Action Buttons */}
              <div className="md:col-span-6 flex flex-col gap-3">
                <div className="space-y-2.5">
                  {questions.length > 0 && questions[currentQuestion].options.map((opt: string, idx: number) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === questions[currentQuestion].correctAnswer;
                    
                    let btnClass = "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/10 shadow-sm";
                    if (showFeedback) {
                      if (isCorrect) btnClass = "bg-green-500/20 border-green-500/50 text-green-600 dark:text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.15)]";
                      else if (isSelected) btnClass = "bg-[#3A0310]/15 dark:bg-[#3A0310]/40 border-[#3A0310] text-[#3A0310] dark:text-white";
                      else btnClass = "bg-white/40 dark:bg-white/5 border-neutral-200 dark:border-white/5 text-neutral-500 dark:text-neutral-400 opacity-70";
                    } else if (isSelected) {
                      btnClass = "bg-[#3A0310]/10 dark:bg-[#3A0310]/40 border-[#3A0310] text-[#3A0310] dark:text-white shadow-[0_0_20px_rgba(58,3,16,0.15)]";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={showFeedback}
                        onClick={() => handleSelect(idx)}
                        className={`w-full text-left p-3.5 px-5 rounded-xl border transition-all font-bold flex justify-between items-center group ${btnClass}`}
                      >
                        <span className="text-sm">{opt}</span>
                        {showFeedback && isCorrect && <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />}
                        {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                        {!showFeedback && <div className={`w-2 h-2 rounded-full border border-neutral-300 dark:border-white/20 group-hover:bg-[#E8B4B8]/50 transition-colors ${isSelected ? 'bg-[#3A0310] dark:bg-[#E8B4B8]' : ''}`} />}
                      </button>
                    );
                  })}
                </div>

                {showFeedback && (
                  <div className="py-2">
                    <button
                      onClick={nextQuestion}
                      className="w-full py-3.5 bg-[#3A0310] force-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#5A051A] transition-all flex justify-center items-center gap-2 shadow-xl active:scale-[0.98] border border-[#E8B4B8]/20"
                    >
                      {currentQuestion < questions.length - 1 ? "Próxima Questão" : "Ver Resultados"}
                      <ChevronRight className="w-5 h-5 force-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md md:max-w-xl px-6 pt-10 flex flex-col items-center text-center"
          >
            <div className="relative w-24 h-24 mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3A0310] to-[#E8B4B8] rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative w-full h-full bg-white dark:bg-white/5 backdrop-blur-xl border border-neutral-200 dark:border-white/10 rounded-full flex items-center justify-center shadow-xl">
                <Medal className="w-12 h-12 text-[#3A0310] dark:text-[#E8B4B8]" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-neutral-800 dark:text-white mb-1 uppercase tracking-tight">Conquista Realizada</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 font-semibold">O teu nome foi gravado nos anais da história.</p>
            
            <div className="w-full grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-4 rounded-[1.5rem] shadow-sm">
                <span className="block text-[8px] uppercase font-black text-neutral-400 dark:text-neutral-500 mb-1 tracking-widest">Pontuação</span>
                <span className="text-2xl font-black text-[#3A0310] dark:text-[#E8B4B8]">{score}</span>
              </div>
              <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-4 rounded-[1.5rem] shadow-sm">
                <span className="block text-[8px] uppercase font-black text-neutral-400 dark:text-neutral-500 mb-1 tracking-widest">Precisão</span>
                <span className="text-2xl font-black text-neutral-800 dark:text-white">
                  {questions.length > 0 ? Math.round((score / questions.reduce((acc: number, q: any) => acc + (q.points || 10), 0)) * 100) || 0 : 0}%
                </span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 max-w-md">
              <button
                onClick={() => setStep("ranking")}
                className="w-full py-3.5 bg-[#3A0310] force-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#5A051A] transition-all shadow-md border border-[#E8B4B8]/20"
              >
                Ver Ranking
              </button>
              <button
                onClick={() => navigate("/app")}
                className="w-full py-3.5 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-white/10 transition-all shadow-sm"
              >
                Concluir
              </button>
            </div>
          </motion.div>
        )}

        {step === "ranking" && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md md:max-w-2xl flex flex-col pt-10 px-6 h-full"
          >
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setStep("intro")} className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-white/10 text-neutral-500 hover:text-[#3A0310] dark:hover:text-white transition-all shadow-sm">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-neutral-800 dark:text-white uppercase tracking-tight">Círculo de Elite</h2>
                <p className="text-[10px] text-[#3A0310] dark:text-[#E8B4B8] uppercase tracking-widest font-black">Os 10 Maiores Académicos</p>
              </div>
            </div>

            {/* Podium Section */}
            {rankings.length > 0 ? (
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
            ) : (
              <div className="flex flex-col items-center justify-center mb-12 py-10 text-center">
                <Trophy className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-3" />
                <p className="text-neutral-400 dark:text-neutral-500 font-bold text-sm">O ranking ainda está vazio.</p>
                <p className="text-neutral-400 dark:text-neutral-600 text-xs mt-1">Jogue o Quiz para ser o primeiro!</p>
              </div>
            )}

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuizPreview() {
  return (
    <MemoryRouter>
      <Quiz />
    </MemoryRouter>
  );
}
