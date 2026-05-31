import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileVideo, Edit3, Trash2, PlusCircle, LayoutGrid, X, Loader2, AlertTriangle, Check, Youtube, Image as ImageIcon, Link2 } from "lucide-react";

type ContentItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  thumbnail: string;
  fullText: string;
  videoUrl?: string;
};

const EMPTY_FORM: ContentItem = {
  id: "",
  type: "video",
  title: "",
  description: "",
  thumbnail: "",
  fullText: "",
  videoUrl: "",
};

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function AdminContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formModal, setFormModal] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<ContentItem>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/content");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Não foi possível carregar os conteúdos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  const filteredItems = filter === "all" ? items : items.filter((i) => i.type === filter);

  const handleDeleteClick = (item: ContentItem) => setDeleteTarget(item);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/content/${deleteTarget.id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Erro ao apagar. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateClick = () => {
    setFormData(EMPTY_FORM);
    setFormMode("create");
    setSaveSuccess(false);
    setError("");
    setFormModal(true);
  };

  const handleEditClick = (item: ContentItem) => {
    setFormData({ ...item, videoUrl: item.videoUrl || "" });
    setFormMode("edit");
    setSaveSuccess(false);
    setError("");
    setFormModal(true);
  };

  // Auto-preencher thumbnail quando é YouTube
  const handleVideoUrlChange = (url: string) => {
    setFormData(d => {
      const ytThumb = getYouTubeThumbnail(url);
      return {
        ...d,
        videoUrl: url,
        thumbnail: ytThumb && !d.thumbnail ? ytThumb : d.thumbnail,
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'thumbnail' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'thumbnail') setUploadingThumb(true);
    else setUploadingVideo(true);
    setError("");

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro no upload");

      if (target === 'thumbnail') {
        setFormData(d => ({ ...d, thumbnail: data.url }));
      } else {
        setFormData(d => ({ ...d, videoUrl: data.url }));
      }
    } catch (err: any) {
      setError(err.message || "Erro no upload. Tente novamente.");
    } finally {
      if (target === 'thumbnail') setUploadingThumb(false);
      else setUploadingVideo(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const method = formMode === "create" ? "POST" : "PUT";
      const url = formMode === "create" ? "/api/content" : `/api/content/${formData.id}`;

      // Auto-gerar thumbnail de YouTube se não houver
      let thumbnail = formData.thumbnail;
      if (!thumbnail && formData.videoUrl) {
        thumbnail = getYouTubeThumbnail(formData.videoUrl) || "";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          thumbnail,
          fullText: formData.fullText,
          videoUrl: formData.videoUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao guardar");
      if (formMode === "create") {
        setItems(prev => [data, ...prev]);
      } else {
        setItems(prev => prev.map(i => i.id === data.id ? data : i));
      }
      setSaveSuccess(true);
      setTimeout(() => { setFormModal(false); setSaveSuccess(false); }, 1200);
    } catch (err: any) {
      setError(err.message || "Erro ao guardar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const thumbSrc = (item: ContentItem) => {
    if (item.thumbnail) return item.thumbnail;
    if (item.videoUrl) return getYouTubeThumbnail(item.videoUrl) || "";
    return "";
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3A0310] border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
            <FileVideo className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Gerir Conteúdo</h1>
            <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">Vídeos, textos e podcasts</p>
          </div>
        </div>
        <button onClick={handleCreateClick} className="bg-[#3A0310] hover:bg-[#5A0520] p-3 rounded-2xl border border-[#E8B4B8]/30 shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 px-5 text-white text-xs font-black uppercase tracking-widest">
          <PlusCircle className="w-5 h-5" /> Publicar
        </button>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 md:mx-0 md:px-0">
        {["all", "video", "text", "podcast", "jindungo"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${filter === f ? "bg-[#3A0310] text-white border-transparent shadow-lg" : "bg-white dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-50 dark:hover:bg-white/10"}`}>
            {f === "all" && "Todos"}{f === "video" && "Vídeos"}{f === "text" && "Textos"}{f === "podcast" && "Áudios"}{f === "jindungo" && "Jindungo"}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.04 }}
                className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[1.5rem] overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-all group">
                <div className="h-40 bg-neutral-100 dark:bg-[#0F0F0F] relative w-full overflow-hidden border-b border-neutral-100 dark:border-white/5">
                  {item.type === "video" && item.videoUrl ? (
                    getYouTubeId(item.videoUrl) ? (
                      <iframe src={`https://www.youtube.com/embed/${getYouTubeId(item.videoUrl)}`} className="w-full h-full" frameBorder="0" allowFullScreen></iframe>
                    ) : (
                      <video src={item.videoUrl} controls className="w-full h-full object-cover"></video>
                    )
                  ) : thumbSrc(item) ? (
                    <img src={thumbSrc(item)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-neutral-300 dark:text-neutral-700" />
                    </div>
                  )}
                  {item.type !== "video" && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] font-black text-white tracking-widest pointer-events-none">
                    {item.type.toUpperCase()}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-[#3A0310] dark:text-white font-black text-sm uppercase tracking-tight line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[10px] font-medium leading-relaxed line-clamp-2 flex-1">{item.description}</p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-white/10">
                    <button onClick={() => handleEditClick(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest text-[#3A0310] dark:text-[#E8B4B8] bg-[#3A0310]/5 dark:bg-[#E8B4B8]/10 rounded-xl hover:bg-[#3A0310]/10 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Apagar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredItems.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 border-dashed">
              <LayoutGrid className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px]">Nenhum conteúdo. Clique em "Publicar" para adicionar!</p>
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
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-black text-center text-neutral-900 dark:text-white uppercase tracking-tight mb-2">Tem a certeza?</h2>
              <p className="text-center text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-1">Vai apagar permanentemente:</p>
              <p className="text-center font-black text-[#3A0310] dark:text-[#E8B4B8] text-sm uppercase tracking-tight mb-8">"{deleteTarget.title}"</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                <button onClick={handleDeleteConfirm} disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? "A Apagar..." : "Apagar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {formModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setFormModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between mb-7">
                <div>
                  <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                    {formMode === "create" ? "Publicar Conteúdo" : "Editar Conteúdo"}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#3A0310]/70 dark:text-[#E8B4B8]/70 mt-0.5">
                    {formMode === "create" ? "Adicionar novo artigo, vídeo ou podcast" : "Atualizar este conteúdo"}
                  </p>
                </div>
                <button onClick={() => setFormModal(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 mb-5">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Tipo */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Tipo de Conteúdo</label>
                  <div className="flex gap-2 flex-wrap">
                    {["video", "text", "podcast", "jindungo"].map((t) => (
                      <button type="button" key={t} onClick={() => setFormData(d => ({ ...d, type: t }))}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.type === t ? "bg-[#3A0310] text-white border-transparent" : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-white/10"}`}>
                        {t === "video" && "🎬 Vídeo"}{t === "text" && "📝 Texto"}{t === "podcast" && "🎙️ Podcast"}{t === "jindungo" && "🌶️ Jindungo"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Título *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} required
                    placeholder="Ex: A História do Kwanza"
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-[#3A0310] dark:focus:border-[#E8B4B8]/50 transition-colors" />
                </div>

                {/* Descrição */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Descrição Curta *</label>
                  <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} required rows={2}
                    placeholder="Resumo breve para aparecer nos cartões..."
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-[#3A0310] dark:focus:border-[#E8B4B8]/50 transition-colors resize-none" />
                </div>

                {/* Vídeo URL — só para tipo video */}
                {formData.type === "video" && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5 block">
                      <Youtube className="w-3.5 h-3.5 text-red-500" /> Link do Vídeo ou Upload do seu Dispositivo
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link2 className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                        <input type="url" value={formData.videoUrl || ""} onChange={e => handleVideoUrlChange(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 pl-10 pr-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-red-500 dark:focus:border-red-500/50 transition-colors" />
                      </div>
                      <div className="relative overflow-hidden shrink-0">
                        <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <button type="button" disabled={uploadingVideo} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50 h-full flex items-center justify-center min-w-[100px]">
                          {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                        </button>
                      </div>
                    </div>
                    {formData.videoUrl && getYouTubeId(formData.videoUrl) && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10">
                        <img src={`https://img.youtube.com/vi/${getYouTubeId(formData.videoUrl)}/hqdefault.jpg`} alt="YouTube preview" className="w-full h-32 object-cover" />
                        <p className="text-[10px] text-center text-green-600 dark:text-green-400 font-black uppercase tracking-widest py-1.5 bg-green-50 dark:bg-green-500/10">✓ YouTube detectado — miniatura gerada automaticamente</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Imagem de Capa */}
                {formData.type !== "video" && (
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5 block">
                      <ImageIcon className="w-3.5 h-3.5" /> Imagem de Capa (URL ou Upload)
                    </label>
                    <div className="flex gap-2">
                      <input type="url" value={formData.thumbnail} onChange={e => setFormData(d => ({ ...d, thumbnail: e.target.value }))}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="flex-1 w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-[#3A0310] dark:focus:border-[#E8B4B8]/50 transition-colors" />
                      <div className="relative overflow-hidden shrink-0">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <button type="button" disabled={uploadingThumb} className="bg-[#3A0310] hover:bg-[#5A051A] text-white rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50 h-full flex items-center justify-center min-w-[100px]">
                          {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                        </button>
                      </div>
                    </div>
                    {formData.thumbnail && (
                      <img src={formData.thumbnail} alt="Pré-visualização" className="mt-3 h-24 w-full object-cover rounded-xl border border-neutral-200 dark:border-white/10" />
                    )}
                  </div>
                )}

                {/* Conteúdo completo */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">
                    {formData.type === "video" ? "Descrição / Transcrição do Vídeo" : "Texto / Conteúdo Completo"}
                  </label>
                  <textarea value={formData.fullText} onChange={e => setFormData(d => ({ ...d, fullText: e.target.value }))} rows={6}
                    placeholder={formData.type === "video" ? "Descreva o conteúdo do vídeo ou adicione a transcrição..." : "Escreva aqui o artigo completo..."}
                    className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-[#3A0310] dark:focus:border-[#E8B4B8]/50 transition-colors resize-none" />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setFormModal(false)} className="flex-1 py-3.5 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                  <button type="submit" disabled={saving || saveSuccess}
                    className={`flex-1 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${saveSuccess ? "bg-green-500 text-white" : "bg-gradient-to-r from-[#3A0310] to-[#5A0520] text-white hover:opacity-90"} disabled:opacity-70`}>
                    {saveSuccess ? <><Check className="w-4 h-4" /> Guardado!</> : saving ? <><Loader2 className="w-4 h-4 animate-spin" /> A Guardar...</> : formMode === "create" ? "Publicar Conteúdo" : "Guardar Alterações"}
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
