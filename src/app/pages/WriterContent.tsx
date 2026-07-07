import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { PenLine, Loader2, AlertTriangle, Check, Image as ImageIcon, Link2, Youtube, FileText, Mic } from "lucide-react";

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url: string) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

const EMPTY_FORM = {
  type: "text",
  title: "",
  fullText: "",
  thumbnail: "",
  videoUrl: "",
};

export function WriterContent() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [retryId, setRetryId] = useState<string | null>(null);

  useEffect(() => {
    const retry = localStorage.getItem('retryContent');
    if (retry) {
      try {
        const data = JSON.parse(retry);
        setRetryId(data.id || null);
        setFormData({
          type: data.type || 'text',
          title: data.title || '',
          fullText: data.fullText || '',
          thumbnail: data.thumbnail || '',
          videoUrl: data.videoUrl || '',
        });
      } catch {}
      localStorage.removeItem('retryContent');
    }
  }, []);

  const handleVideoUrlChange = (url: string) => {
    setFormData(d => {
      const ytThumb = getYouTubeThumbnail(url);
      const newThumbnail = ytThumb && !d.thumbnail ? ytThumb : d.thumbnail;
      return { ...d, videoUrl: url, thumbnail: newThumbnail };
    });
    if (url && !getYouTubeId(url) && formData.type === "podcast" && !formData.thumbnail) {
      const isSpotify = /open\.spotify\.com/i.test(url);
      const apiEndpoint = isSpotify ? '/api/spotify-oembed' : '/api/og-image';
      fetch(`${apiEndpoint}?url=${encodeURIComponent(url)}`)
        .then(r => r.json())
        .then(data => {
          if (data.thumbnail) setFormData(d => ({ ...d, thumbnail: data.thumbnail }));
        })
        .catch(() => {});
    }
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
      setFormData(d => ({ ...d, thumbnail: data.url }));
    } catch (err: any) {
      setError(err.message || "Erro no upload.");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let thumbnail = formData.thumbnail;
      if (!thumbnail && formData.videoUrl) {
        thumbnail = getYouTubeThumbnail(formData.videoUrl) || "";
      }

      // Se for uma retoma, apagar o conteúdo rejeitado antigo
      if (retryId) {
        await fetch(`/api/content/${retryId}/cancel`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.fullText ? (formData.fullText.length > 150 ? formData.fullText.substring(0, 150) + "..." : formData.fullText) : "",
          type: formData.type,
          thumbnail,
          fullText: formData.fullText,
          videoUrl: formData.videoUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao publicar");
      setRetryId(null);
      setSaveSuccess(true);
      setFormData(EMPTY_FORM);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao publicar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 border border-emerald-700/20 flex items-center justify-center shadow-lg">
            <PenLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Criar Conteúdo</h1>
            <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">
              Os teus conteúdos ficam pendentes até aprovação
            </p>
          </div>
        </div>
        <Link to="/app/my-content" className="flex items-center gap-2 bg-[#3A0310]/10 dark:bg-white/10 text-[#3A0310] dark:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#3A0310]/20 dark:hover:bg-white/20 transition-colors border border-[#3A0310]/20 dark:border-white/20">
          <FileText className="w-4 h-4" />
          Meus Conteúdos
        </Link>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" /> Conteúdo enviado para revisão!
        </div>
      )}

      {/* Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[2rem] p-6 shadow-lg">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#3A0310] dark:text-white mb-5">Novo Conteúdo</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Tipo</label>
            <div className="flex gap-2 flex-wrap">
              {["text", "video", "podcast", "jindungo"].map((t) => (
                <button type="button" key={t} onClick={() => setFormData(d => ({ ...d, type: t }))}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.type === t ? "bg-[#3A0310] text-white border-transparent" : "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10 hover:bg-neutral-200 dark:hover:bg-white/10"}`}>
                  {t === "text" && "📝 Texto"}{t === "video" && "🎬 Vídeo"}{t === "podcast" && "🎙️ Áudio"}{t === "jindungo" && "🌶️ Jindungo"}
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

          {/* Conteúdo */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">
              {formData.type === "video" ? "Descrição / Transcrição" : "Texto / Conteúdo Completo"} *
            </label>
            <textarea value={formData.fullText} onChange={e => setFormData(d => ({ ...d, fullText: e.target.value }))} rows={6} required
              placeholder="Escreva aqui o artigo completo..."
              className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-[#3A0310] dark:focus:border-[#E8B4B8]/50 transition-colors resize-none" />
          </div>

          {/* Vídeo URL */}
          {(formData.type === "video" || formData.type === "podcast") && (
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5 block">
                {formData.type === "podcast" ? <Mic className="w-3.5 h-3.5 text-[#3A0310] dark:text-[#E8B4B8]" /> : <Youtube className="w-3.5 h-3.5 text-red-500" />} Link do {formData.type === "podcast" ? "Áudio" : "Vídeo"}
              </label>
              <div className="relative">
                <Link2 className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                <input type="text" value={formData.videoUrl || ""} onChange={e => handleVideoUrlChange(e.target.value)}
                  placeholder={formData.type === "podcast" ? "Link do áudio (SoundCloud, Spotify, etc.)" : "https://www.youtube.com/watch?v=..."}
                  className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 pl-10 pr-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-red-500 dark:focus:border-red-500/50 transition-colors" />
              </div>
            </div>
          )}

          {/* Thumbnail */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 flex items-center gap-1.5 block">
              <ImageIcon className="w-3.5 h-3.5" /> Imagem de Capa
            </label>
            <div className="flex gap-2">
              <input type="text" value={formData.thumbnail} onChange={e => setFormData(d => ({ ...d, thumbnail: e.target.value }))}
                placeholder="https://exemplo.com/imagem.jpg"
                className="flex-1 w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl py-3 px-4 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm font-medium focus:outline-none focus:border-[#3A0310] dark:focus:border-[#E8B4B8]/50 transition-colors" />
              <div className="relative overflow-hidden shrink-0">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <button type="button" disabled={uploadingThumb} style={{ color: 'white' }} className="bg-[#3A0310] hover:bg-[#5A051A] !text-white rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50 h-full flex items-center justify-center min-w-[100px]">
                  {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin !text-white" /> : "Upload"}
                </button>
              </div>
            </div>
            {formData.thumbnail && (
              <div className="relative mt-3 h-24 w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-black/5">
                <div className="absolute inset-0">
                  <img src={formData.thumbnail} alt="" className="w-full h-full object-cover opacity-40 blur-md scale-110" />
                </div>
                <img src={formData.thumbnail} alt="" className="relative z-10 h-full w-full object-contain" />
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={saving || saveSuccess} style={{ color: 'white' }}
            className={`w-full py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${saveSuccess ? "bg-green-500" : "bg-gradient-to-r from-[#3A0310] to-[#5A0520] hover:opacity-90"} disabled:opacity-70`}>
            {saveSuccess ? <><Check className="w-4 h-4" style={{ color: 'white' }} /> Enviado!</> : saving ? <><Loader2 className="w-4 h-4 animate-spin" style={{ color: 'white' }} /> A Enviar...</> : "Enviar para Revisão"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
