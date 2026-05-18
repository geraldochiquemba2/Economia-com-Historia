import React, { useState } from "react";
import { Link, MemoryRouter, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, CheckCircle, XCircle, ChevronRight, Medal, Flame, Award, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { quizQuestions, rankingData } from "../data/mockData";

import imgWinner from "../../imports/image-5.png";
import imgSecond from "../../imports/image-6.png";
import imgThird from "../../imports/image-7.png";

export function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"intro" | "play" | "result" | "ranking">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleStart = () => {
    setStep("play");
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (idx === quizQuestions[currentQuestion].correctAnswer) {
      setScore(s => s + 10);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(q => q + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setStep("result");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] pb-24 text-neutral-100 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md px-6 flex flex-col items-center justify-center min-h-[80vh]"
          >
            <div className="relative w-full aspect-square max-w-[300px] mb-12 group">
              <div className="absolute inset-0 bg-[#3A0310] rounded-[3rem] rotate-6 opacity-20 group-hover:rotate-12 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-[#3A0310] rounded-[3rem] -rotate-3 opacity-20 group-hover:-rotate-6 transition-transform duration-700 delay-100"></div>
              <div className="relative h-full w-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1586974710160-55f48f417990?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Coins and History"
                  className="w-full h-full object-cover grayscale-[20%] brightness-[0.7]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3A0310]/80 via-transparent to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <Trophy className="w-10 h-10 text-[#E8B4B8]" />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-black text-white mb-4 tracking-tighter text-center uppercase">
              Duelo de <span className="text-[#E8B4B8]">Prestígio</span>
            </h1>
            <p className="text-neutral-400 text-center mb-10 max-w-[280px] leading-relaxed text-sm font-medium">
              Demonstra o teu domínio sobre a economia histórica e ascende na hierarquia global.
            </p>

            <div className="w-full space-y-4">
              <button
                onClick={handleStart}
                className="w-full py-5 bg-[#3A0310] text-white rounded-2xl font-black text-lg hover:bg-[#5A051A] transition-all shadow-[0_10px_30px_rgba(58,3,16,0.4)] active:scale-[0.98]"
              >
                Começar Desafio
              </button>
              <button
                onClick={() => setStep("ranking")}
                className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-md"
              >
                Ver Ranking Global
              </button>
            </div>
            
            <Link to="/app" className="mt-8 flex items-center gap-2 text-neutral-500 font-bold uppercase tracking-widest text-[10px] hover:text-[#E8B4B8] transition-colors">
              <ArrowLeft className="w-3 h-3" /> Voltar ao Início
            </Link>
          </motion.div>
        )}

        {step === "play" && (
          <motion.div
            key="play"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-md flex flex-col h-full pt-10 px-6"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#E8B4B8] uppercase tracking-[0.2em]">Questão {currentQuestion + 1} / {quizQuestions.length}</span>
                <div className="flex gap-1 mt-2">
                  {quizQuestions.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= currentQuestion ? 'w-6 bg-[#3A0310]' : 'w-2 bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#E8B4B8]" />
                <span className="text-white font-black">{score}</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-bold leading-tight text-white mb-2">
                {quizQuestions[currentQuestion].question}
              </h2>
            </div>

            <div className="space-y-4 flex-1">
              {quizQuestions[currentQuestion].options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === quizQuestions[currentQuestion].correctAnswer;
                
                let btnClass = "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10";
                if (showFeedback) {
                  if (isCorrect) btnClass = "bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                  else if (isSelected) btnClass = "bg-[#3A0310]/40 border-[#3A0310] text-white";
                  else btnClass = "bg-white/5 border-white/5 text-neutral-600 opacity-50";
                } else if (isSelected) {
                  btnClass = "bg-[#3A0310]/40 border-[#3A0310] text-white shadow-[0_0_20px_rgba(58,3,16,0.2)]";
                }

                return (
                  <button
                    key={idx}
                    disabled={showFeedback}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all font-bold flex justify-between items-center group ${btnClass}`}
                  >
                    <span className="text-sm">{opt}</span>
                    {showFeedback && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                    {!showFeedback && <div className={`w-2 h-2 rounded-full border border-white/20 group-hover:bg-[#E8B4B8]/50 transition-colors ${isSelected ? 'bg-[#E8B4B8]' : ''}`} />}
                  </button>
                );
              })}

              <AnimatePresence>
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-[#3A0310]/10 border border-[#3A0310]/30 rounded-[2rem] text-sm font-medium mt-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#3A0310]"></div>
                    <p className="text-[#E8B4B8] font-black uppercase text-[9px] tracking-widest mb-2">Sabedoria Histórica</p>
                    <p className="text-neutral-300 leading-relaxed italic">"{quizQuestions[currentQuestion].feedback}"</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {showFeedback && (
              <div className="py-8">
                <button
                  onClick={nextQuestion}
                  className="w-full py-5 bg-[#3A0310] text-white rounded-2xl font-black text-lg hover:bg-[#5A051A] transition-all flex justify-center items-center gap-2 shadow-2xl active:scale-[0.98]"
                >
                  {currentQuestion < quizQuestions.length - 1 ? "Próxima Questão" : "Ver Resultados"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md px-6 pt-20 flex flex-col items-center text-center"
          >
            <div className="relative w-40 h-40 mb-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3A0310] to-[#E8B4B8] rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-full h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
                <Medal className="w-20 h-20 text-[#E8B4B8]" />
              </div>
            </div>
            
            <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Conquista Realizada</h2>
            <p className="text-neutral-400 mb-12 font-medium">O teu nome foi gravado nos anais da história.</p>
            
            <div className="w-full grid grid-cols-2 gap-4 mb-12">
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                <span className="block text-[9px] uppercase font-black text-neutral-500 mb-2 tracking-widest">Pontuação</span>
                <span className="text-4xl font-black text-[#E8B4B8]">{score}</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
                <span className="block text-[9px] uppercase font-black text-neutral-500 mb-2 tracking-widest">Precisão</span>
                <span className="text-4xl font-black text-white">{Math.round((score / (quizQuestions.length * 10)) * 100)}%</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <button
                onClick={() => setStep("ranking")}
                className="w-full py-5 bg-[#3A0310] text-white rounded-2xl font-black text-lg hover:bg-[#5A051A] transition-all shadow-2xl"
              >
                Ver Ranking Global
              </button>
              <button
                onClick={() => navigate("/app")}
                className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                Concluir Jornada
              </button>
            </div>
          </motion.div>
        )}

        {step === "ranking" && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md flex flex-col pt-10 px-6 h-full"
          >
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setStep("intro")} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-neutral-400 hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Círculo de Elite</h2>
                <p className="text-[10px] text-[#E8B4B8] uppercase tracking-widest font-black">Os 10 Maiores Académicos</p>
              </div>
            </div>

            {/* Podium Section - Redesigned for Dark Wealth */}
            <div className="flex justify-center items-end gap-3 mb-12 h-64 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#3A0310]/5 to-transparent rounded-[3rem] -z-10"></div>
              
              {/* 2nd Place */}
              <div className="flex flex-col items-center flex-1 h-[75%] group">
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-2xl border-2 border-neutral-600 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
                    <ImageWithFallback src={imgSecond} alt="2nd place" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-neutral-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-xl border border-white/10">2º</div>
                </div>
                <p className="text-white font-bold text-[10px] text-center mb-1 truncate w-full uppercase tracking-tighter">{rankingData[1]?.name || "Ana"}</p>
                <div className="w-full flex-1 bg-white/5 backdrop-blur-md rounded-t-2xl border-t border-x border-white/10 flex flex-col items-center justify-center pt-4 shadow-2xl">
                   <Award className="w-5 h-5 text-neutral-400 opacity-50 mb-2" />
                   <span className="text-neutral-400 font-black text-xs">{rankingData[1]?.points || 3800}</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center flex-1 h-full group">
                <div className="relative mb-4">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                    <Trophy className="w-8 h-8 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  </div>
                  <div className="w-20 h-20 rounded-2xl border-2 border-[#E8B4B8] overflow-hidden shadow-[0_0_40px_rgba(58,3,16,0.6)] group-hover:scale-105 transition-transform duration-500">
                    <ImageWithFallback src={imgWinner} alt="1st place" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#3A0310] rounded-lg flex items-center justify-center text-xs font-black text-[#E8B4B8] shadow-xl border border-[#E8B4B8]/30">1º</div>
                </div>
                <p className="text-white font-black text-xs text-center mb-1 truncate w-full uppercase tracking-tight">{rankingData[0]?.name || "Mário"}</p>
                <div className="w-full flex-1 bg-gradient-to-t from-[#3A0310]/40 to-white/10 backdrop-blur-md rounded-t-[2.5rem] border-t border-x border-[#3A0310]/50 flex flex-col items-center justify-center pt-6 shadow-2xl">
                   <Award className="w-6 h-6 text-[#E8B4B8] mb-2" />
                   <span className="text-[#E8B4B8] font-black text-sm">{rankingData[0]?.points || 4500}</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center flex-1 h-[65%] group">
                <div className="relative mb-3">
                  <div className="w-14 h-14 rounded-2xl border-2 border-orange-900/50 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
                    <ImageWithFallback src={imgThird} alt="3rd place" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-900/50 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-xl border border-white/10">3º</div>
                </div>
                <p className="text-white font-bold text-[10px] text-center mb-1 truncate w-full uppercase tracking-tighter">{rankingData[2]?.name || "Sofia"}</p>
                <div className="w-full flex-1 bg-white/5 backdrop-blur-md rounded-t-xl border-t border-x border-white/10 flex flex-col items-center justify-center pt-2 shadow-2xl">
                   <Award className="w-4 h-4 text-orange-900/50 mb-1" />
                   <span className="text-neutral-500 font-black text-[10px]">{rankingData[2]?.points || 3200}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pb-8 hide-scrollbar">
              {rankingData.slice(3).map((user, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  key={user.id} 
                  className="flex items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-[#3A0310]/30 transition-all group"
                >
                  <span className="w-8 font-black text-neutral-600 group-hover:text-white transition-colors">{idx + 4}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm leading-tight uppercase tracking-tight">{user.name}</h3>
                    <p className="text-neutral-500 text-[9px] font-black tracking-widest uppercase mt-0.5">Membro de Elite</p>
                  </div>
                  <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                    <span className="text-[#E8B4B8] font-black text-[10px] tracking-widest">{user.points} XP</span>
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
