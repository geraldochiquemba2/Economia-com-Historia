import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Save, X, RefreshCw, AlertCircle } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  feedback: string;
  points: number;
}

export function AdminQuiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    feedback: '',
    points: 10
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/quiz');
      if (!response.ok) throw new Error('Falha ao carregar perguntas');
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenModal = (q?: QuizQuestion) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        feedback: q.feedback,
        points: q.points
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        feedback: '',
        points: 10
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editingQuestion ? `/api/admin/quiz/${editingQuestion.id}` : '/api/admin/quiz';
      const method = editingQuestion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erro ao salvar');
      await fetchQuestions();
      setIsModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar a pergunta. Tente novamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja apagar esta pergunta?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/admin/quiz/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao apagar');
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      alert('Erro ao apagar a pergunta.');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 text-[#3A0310] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-neutral-800 dark:text-white uppercase tracking-tighter">Gestão de Quiz</h1>
          <p className="text-sm text-neutral-500">Crie e edite as perguntas do Círculo de Elite.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#3A0310] text-white rounded-lg hover:bg-[#5A081B] transition-colors shadow-lg font-bold"
        >
          <Plus className="w-5 h-5" />
          Nova Pergunta
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-500 uppercase tracking-wider">
              <th className="p-4">Pergunta</th>
              <th className="p-4">Pontos</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors group">
                <td className="p-4">
                  <div className="font-bold text-neutral-800 dark:text-white line-clamp-2">{q.question}</div>
                  <div className="text-xs text-neutral-500 mt-1 line-clamp-1">{q.feedback}</div>
                </td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold">
                    {q.points} XP
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(q)}
                      className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {questions.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-neutral-500 font-medium">
                  Nenhuma pergunta encontrada. Crie a sua primeira pergunta!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between">
                <h2 className="text-xl font-black text-neutral-800 dark:text-white uppercase tracking-tight">
                  {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="quiz-form" onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                      Pergunta
                    </label>
                    <textarea
                      required
                      value={formData.question}
                      onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#3A0310] dark:focus:ring-[#E8B4B8] focus:border-transparent transition-all text-neutral-800 dark:text-white min-h-[100px]"
                      placeholder="Qual é a questão?"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                      Opções e Resposta Correta
                    </label>
                    {formData.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={formData.correctAnswer === idx}
                          onChange={() => setFormData(prev => ({ ...prev, correctAnswer: idx }))}
                          className="w-5 h-5 text-[#3A0310] focus:ring-[#3A0310] border-neutral-300"
                        />
                        <input
                          required
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className={`flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#3A0310] focus:border-transparent transition-all text-neutral-800 dark:text-white ${
                            formData.correctAnswer === idx 
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/30' 
                              : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700'
                          }`}
                          placeholder={`Opção ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                      Feedback Histórico (Mostrado após responder)
                    </label>
                    <textarea
                      required
                      value={formData.feedback}
                      onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#3A0310] dark:focus:ring-[#E8B4B8] focus:border-transparent transition-all text-neutral-800 dark:text-white min-h-[100px]"
                      placeholder="Explique o contexto ou facto histórico..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                      Pontos (XP)
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 10 }))}
                      className="w-full max-w-[150px] px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-[#3A0310] dark:focus:ring-[#E8B4B8] focus:border-transparent transition-all text-neutral-800 dark:text-white"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-neutral-600 dark:text-neutral-300 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="quiz-form"
                  className="px-6 py-2.5 bg-[#3A0310] text-white font-bold rounded-xl hover:bg-[#5A081B] transition-colors shadow-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Pergunta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
