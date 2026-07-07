import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Loader2, AlertTriangle, Eye, RefreshCw, ExternalLink, Filter } from 'lucide-react';
import { useNavigate } from 'react-router';

interface CommentAnalysis {
  id: number;
  status: string;
  motivo: string;
  severidade: string;
  comment: {
    id: string;
    text: string;
    author: string;
    contentId: string;
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

type FilterStatus = 'todos' | 'abusivo' | 'violacao' | 'suspeito' | 'limpo';

export function AdminAIComments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [selectedComment, setSelectedComment] = useState<CommentAnalysis | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('todos');
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null);

  // Carregar última análise da API ao montar
  React.useEffect(() => {
    const loadSaved = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/admin/comments/analysis', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.analysis && data.analysis.length > 0) {
            setResult(data);
            if (data.createdAt) {
              setLastAnalyzed(new Date(data.createdAt).toLocaleString('pt-PT'));
            }
          }
        }
      } catch {}
    };
    loadSaved();
  }, []);

  const filteredComments = useMemo(() => {
    if (!result) return [];
    if (filter === 'todos') return result.analysis;
    return result.analysis.filter(item => item.status === filter);
  }, [result, filter]);

  const filterCounts = useMemo(() => {
    if (!result) return { todos: 0, abusivo: 0, violacao: 0, suspeito: 0, limpo: 0 };
    const counts = { todos: result.analysis.length, abusivo: 0, violacao: 0, suspeito: 0, limpo: 0 };
    result.analysis.forEach(item => {
      if (item.status in counts) counts[item.status as keyof typeof counts]++;
    });
    return counts;
  }, [result]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setFilter('todos');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Não tem sessão ativa. Faça login novamente.');
        return;
      }
      const res = await fetch('/api/admin/comments/analyze', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.error || 'Erro ao analisar');
      }
      setResult(data);
      if (data.createdAt) {
        setLastAnalyzed(new Date(data.createdAt).toLocaleString('pt-PT'));
      } else {
        const now = new Date().toLocaleString('pt-PT');
        setLastAnalyzed(now);
      }
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

  const filterButtons: { key: FilterStatus; label: string; color: string }[] = [
    { key: 'todos', label: 'Todos', color: 'bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-white/20' },
    { key: 'abusivo', label: 'Abusivos', color: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-400 dark:border-red-500/30' },
    { key: 'violacao', label: 'Violações', color: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-400 dark:border-red-500/30' },
    { key: 'suspeito', label: 'Suspeitos', color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-400 dark:border-amber-500/30' },
    { key: 'limpo', label: 'Limpos', color: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-400 dark:border-green-500/30' },
  ];

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
            {lastAnalyzed ? `Última análise: ${lastAnalyzed}` : 'Análise automática de comentários abusivos'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-white/5 border border-[#3A0310]/20 dark:border-white/10 text-[#3A0310] dark:text-white rounded-2xl hover:bg-neutral-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Atualizar
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {loading ? "A analisar..." : result ? "Re-analisar" : "Analisar Comentários"}
          </button>
        </div>
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

      {/* Filter Buttons */}
      {result && result.analysis.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
          {filterButtons.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all whitespace-nowrap shrink-0 ${
                filter === f.key
                  ? `${f.color} shadow-sm`
                  : 'bg-transparent text-neutral-400 dark:text-neutral-500 border-transparent hover:bg-neutral-100 dark:hover:bg-white/5'
              }`}
            >
              {f.label}
              <span className="text-[9px] opacity-70">({filterCounts[f.key]})</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Comments List */}
      {result && filteredComments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-neutral-500">
            Comentários Analisados ({filteredComments.length})
          </h3>
          {filteredComments.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-white/5 border rounded-2xl p-4 hover:shadow-md transition-all ${
                item.status === 'abusivo' || item.status === 'violacao'
                  ? 'border-red-300 dark:border-red-500/30'
                  : item.status === 'suspeito'
                  ? 'border-amber-300 dark:border-amber-500/30'
                  : 'border-neutral-200 dark:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setSelectedComment(selectedComment?.id === item.id ? null : item)}
                >
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
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-[9px] text-neutral-400 font-bold">{item.motivo}</p>
                  {item.comment?.contentId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/explore/${item.comment.contentId}`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#3A0310] dark:bg-white/10 text-white dark:text-[#E8B4B8] rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-[#5A051A] dark:hover:bg-white/20 transition-all active:scale-95"
                    >
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                  )}
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

      {result && filteredComments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">Nenhum comentário encontrado para este filtro.</p>
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
