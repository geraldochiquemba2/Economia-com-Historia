import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, Trash2, PlusCircle, LayoutGrid, X, Loader2, AlertTriangle, Check, Image as ImageIcon, Star } from "lucide-react";

type TriviaItem = {
  id: string;
  title: string;
  fact: string;
  imageUrl: string;
  isActive: boolean;
};

const EMPTY_FORM = {
  title: "",
  fact: "",
  imageUrl: "",
};

export function AdminTrivia() {
  const [items, setItems] = useState<TriviaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<TriviaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const [uploadingThumb, setUploadingThumb] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trivia");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Não foi possível carregar as curiosidades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  const handleDeleteClick = (item: TriviaItem) => setDeleteTarget(item);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/trivia/${deleteTarget.id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Erro ao apagar. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async (item: TriviaItem) => {
    try {
      const res = await fetch(`/api/trivia/${item.id}/activate`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error();
      setItems(prev => prev.map(i => ({ ...i, isActive: i.id === item.id })));
    } catch {
      setError("Erro ao ativar curiosidade.");
    }
  };

  const handleCreateClick = () => {
    setFormData(EMPTY_FORM);
    setSaveSuccess(false);
    setError("");
    setFormModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
    setError("");

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");

      setFormData(d => ({ ...d, imageUrl: data.url }));
    } catch (err: any) {
      setError(err.message || "Erro no upload. Tente novamente.");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/trivia", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar");
      
      setItems(prev => [data, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => { setFormModal(false); setSaveSuccess(false); }, 1200);
    } catch (err: any) {
      setError(err.message || "Erro ao guardar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3A0310] border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
            <Lightbulb className="w-6 h-6 text-white force-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Sabias que...?</h1>
            <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">Curiosidades da Página Inicial</p>
          </div>
        </div>
        <button onClick={handleCreateClick} className="bg-[#3A0310] hover:bg-[#5A0520] p-3 rounded-2xl border border-[#E8B4B8]/30 shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 px-5 text-xs font-black uppercase tracking-widest" style={{ color: 'white' }}>
          <PlusCircle className="w-5 h-5" style={{ color: 'white' }} /> Criar Nova
        </button>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.04 }}
                className={`bg-white dark:bg-white/5 border rounded-[1.5rem] overflow-hidden flex flex-col shadow-lg transition-all group ${item.isActive ? "border-amber-400 dark:border-amber-500/50" : "border-neutral-200 dark:border-white/10"}`}>
                <div className="h-40 bg-neutral-100 dark:bg-[#0F0F0F] relative w-full overflow-hidden border-b border-neutral-100 dark:border-white/5">
                  {item.imageUrl ? (
                    <>
                      <div className="absolute inset-0">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover opacity-40 blur-md scale-110" />
                      </div>
                      <img src={item.imageUrl} alt="" className="relative w-full h-full object-contain z-10 drop-shadow-xl" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                    </div>
                  )}

                  {item.isActive && (
                    <div className="absolute top-2 left-2 z-30 flex items-center gap-1 bg-amber-400 text-black px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">
                      <Star className="w-2.5 h-2.5 fill-black" /> Ativa na Home
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-[#3A0310] dark:text-white font-black text-sm uppercase tracking-tight mb-1">{item.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[10px] font-medium leading-relaxed flex-1 line-clamp-3">{item.fact}</p>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-white/10">
                    <button
                      onClick={() => handleActivate(item)}
                      disabled={item.isActive}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${
                        item.isActive
                          ? "bg-amber-400 text-black cursor-default"
                          : "bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 hover:bg-amber-400/20 hover:text-amber-600"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 shrink-0 ${item.isActive ? "fill-black" : ""}`} />
                      {item.isActive ? "Ativa" : "Definir como Ativa"}
                    </button>
                    <button onClick={() => handleDeleteClick(item)} title="Apagar" className="flex items-center justify-center gap-1.5 py-2 px-3 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 border-dashed">
              <Lightbulb className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px]">Nenhuma curiosidade. Clique em "Criar Nova" para adicionar!</p>
            </motion.div>
          )}
        </div>
      )}

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-black text-center text-neutral-900 dark:text-white uppercase tracking-tight mb-2">Apagar Curiosidade?</h2>
              <p className="text-center font-black text-[#3A0310] dark:text-[#E8B4B8] text-sm uppercase tracking-tight mb-8">"{deleteTarget.title}"</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5">Cancelar</button>
                <button onClick={handleDeleteConfirm} disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                  {deleting ? "A Apagar..." : "Apagar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {formModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setFormModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Criar Curiosidade</h2>
                </div>
                <button onClick={() => setFormModal(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-600 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 mb-5">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Título *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} required
                    placeholder="Ex: Sabias que..."
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-[#3A0310]" />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Facto Histórico / Texto *</label>
                  <textarea value={formData.fact} onChange={e => setFormData(d => ({ ...d, fact: e.target.value }))} rows={4} required
                    placeholder="Escreva a curiosidade..."
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-[#3A0310] resize-none" />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5 block">
                    <ImageIcon className="w-3.5 h-3.5" /> Imagem de Capa (Obrigatório)
                  </label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.imageUrl} onChange={e => setFormData(d => ({ ...d, imageUrl: e.target.value }))} required
                      placeholder="https://exemplo.com/imagem.jpg"
                      className="flex-1 w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-[#3A0310]" />
                    <div className="relative overflow-hidden shrink-0">
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <button type="button" disabled={uploadingThumb} style={{ color: 'white' }} className="bg-[#3A0310] hover:bg-[#5A051A] rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center min-w-[100px]">
                        {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                      </button>
                    </div>
                  </div>
                  {formData.imageUrl && (
                    <div className="relative mt-3 h-24 w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-black/5">
                      <div className="absolute inset-0">
                        <img src={formData.imageUrl} alt="" className="w-full h-full object-cover opacity-40 blur-md scale-110" />
                      </div>
                      <img src={formData.imageUrl} alt="Pré-visualização" className="relative z-10 h-full w-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setFormModal(false)} className="flex-1 py-3.5 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest">Cancelar</button>
                  <button type="submit" disabled={saving || saveSuccess || !formData.imageUrl} style={{ color: 'white' }}
                    className={`flex-1 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 ${saveSuccess ? "bg-green-500" : "bg-gradient-to-r from-[#3A0310] to-[#5A0520] hover:opacity-90"} disabled:opacity-70`}>
                    {saveSuccess ? <><Check className="w-4 h-4" /> Guardado!</> : saving ? <><Loader2 className="w-4 h-4 animate-spin" /> A Guardar...</> : "Criar Curiosidade"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
