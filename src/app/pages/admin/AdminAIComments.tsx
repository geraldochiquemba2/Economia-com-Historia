import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Loader2, AlertTriangle, CheckCircle, Eye, MessageCircle, RefreshCw } from 'lucide-react';

interface CommentAnalysis {
  id: number;
  status: string;
  motivo: string;
  severidade: string;
  comment: {
    id: string;
    text: string;
    author: string;
    contentTitle: string;
    contentType: string;
    createdAt: string;
    isHidden: boolean;
  };
}

interface AnalysisResult {
  analysis: CommentAnalysis[];
  summary: string;
  totalAbusivos: number;
  totalSuspeitos: number;
}

export function AdminAIComments() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [selectedComment, setSelectedComment] = useState<CommentAnalysis | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/comments/analyze', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'abusivo': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-400 dark:border-red-500/30';
      case 'violacao': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-400 dark:border-red-500/30';
      case 'suspeito': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400 dark:border-amber-500/30';
      case 'limpo': return 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-400 dark:border-green-500/30';
      default: return 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-white/20';
    }
  };

  const severityColor = (sev: string) => {
    switch (sev) {
      case 'alta': return 'text-red-600 dark:text-red-400';
      case 'media': return 'text-amber-600 dark:text-amber-400';
      case 'baixa': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-neutral-500';
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Moderação IA</h1>
          <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">
            Análise automática de comentários abusivos
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 font-bold text-xs uppercase tracking-wider shadow-lg"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? "A analisar..." : "Analisar Comentários"}
        </button>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Summary Cards */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-[#3A0310] dark:text-white">{result.analysis.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mt-1">Total Analisados</p>
          </div>
          <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-red-600 dark:text-red-400">{result.totalAbusivos || 0}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-1">Abusivos</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{result.totalSuspeitos || 0}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1">Suspeitos</p>
          </div>
        </motion.div>
      )}

      {/* AI Summary */}
      {result?.summary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-violet-50 dark:bg-violet-500/5 border border-violet-200 dark:border-violet-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">Resumo da IA</span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">{result.summary}</p>
        </motion.div>
      )}

      {/* Comments List */}
      {result && result.analysis.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-500">Comentários Analisados</h3>
          {result.analysis.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-white/5 border rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all ${
                item.status === 'abusivo' || item.status === 'violacao'
                  ? 'border-red-300 dark:border-red-500/30'
                  : item.status === 'suspeito'
                  ? 'border-amber-300 dark:border-amber-500/30'
                  : 'border-neutral-200 dark:border-white/10'
              }`}
              onClick={() => setSelectedComment(selectedComment?.id === item.id ? null : item)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${statusColor(item.status)}`}>
                      {item.status}
                    </span>
                    {item.severidade !== 'nenhuma' && (
                      <span className={`text-[9px] font-bold uppercase ${severityColor(item.severidade)}`}>
                        {item.severidade}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-800 dark:text-white font-medium line-clamp-2">"{item.comment?.text}"</p>
                  <div className="flex items-center gap-3 mt-2 text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                    <span>{item.comment?.author}</span>
                    <span>•</span>
                    <span>{item.comment?.contentTitle || 'N/A'}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] text-neutral-400 font-bold">{item.motivo}</p>
                </div>
              </div>

              <AnimatePresence>
                {selectedComment?.id === item.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-neutral-100 dark:border-white/5 overflow-hidden">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                      <strong className="text-neutral-800 dark:text-white">Texto completo:</strong> "{item.comment?.text}"
                    </p>
                    <p className="text-[9px] text-neutral-400 mt-2">
                      {item.comment?.createdAt && new Date(item.comment.createdAt).toLocaleDateString('pt-PT')} • {item.comment?.contentType}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-20">
          <Shield className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-1">Análise de Comentários com IA</p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium max-w-sm mx-auto">
            Clica em "Analisar Comentários" para que a IA identifique automaticamente comentários abusivos, spam e violações de regras.
          </p>
        </div>
      )}
    </div>
  );
}
