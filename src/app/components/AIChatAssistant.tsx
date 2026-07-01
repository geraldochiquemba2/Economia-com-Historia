import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Loader2, Sparkles, Bot } from "lucide-react";

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply || "Desculpa, não consegui responder." }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Erro de conexão. Tenta novamente." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[52px] right-5 z-50 w-11 h-11 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#3A0310] to-[#E8B4B8] text-white shadow-2xl flex items-center justify-center hover:shadow-[0_0_30px_rgba(232,180,184,0.4)] transition-all active:scale-90"
      >
        {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6 force-white" /> : <Bot className="w-5 h-5 md:w-6 md:h-6 force-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-[110px] right-5 md:right-6 z-50 w-[320px] md:w-[360px] max-w-[calc(100vw-2.5rem)] bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
            style={{ height: "460px", maxHeight: "calc(100vh - 14rem)" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#3A0310] to-[#5A081B] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-sm uppercase tracking-wider force-white">Assistente IA</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest force-white">economia</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-[#3A0310] dark:text-[#E8B4B8]" />
                  </div>
                  <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400 mb-1">Olá! Sou o assistente IA</p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Pergunta sobre conteúdo, quizzes, rankings ou qualquer coisa da plataforma!</p>
                  <div className="mt-4 space-y-2">
                    {["Quais os conteúdos mais vistos?", "Quem está no top do ranking?", "Cria um quiz sobre Angola"].map((q) => (
                      <button key={q} onClick={() => { setInput(q); }}
                        className="block w-full text-left px-3 py-2 bg-neutral-50 dark:bg-white/5 rounded-xl text-[10px] font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors border border-neutral-100 dark:border-white/5">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#3A0310] text-white rounded-br-md"
                      : "bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 rounded-bl-md border border-neutral-200 dark:border-white/10"
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-neutral-100 dark:border-white/5">
              <div className="flex items-center gap-2 bg-neutral-50 dark:bg-white/5 rounded-2xl px-3 py-1 border border-neutral-200 dark:border-white/10 focus-within:border-[#3A0310] dark:focus-within:border-[#E8B4B8] transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Escreve a tua pergunta..."
                  className="flex-1 bg-transparent py-2.5 text-xs text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none font-medium"
                />
                <button onClick={handleSend} disabled={!input.trim() || loading}
                  className="p-2 rounded-xl bg-[#3A0310] hover:bg-[#5A081B] text-white transition-colors disabled:opacity-40">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
