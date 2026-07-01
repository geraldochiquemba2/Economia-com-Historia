import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder, Plus, Edit2, Trash2, X, Loader2, AlertTriangle, Check, Eye, EyeOff,
  FileText, Play, Mic, Flame, Award, BookOpen, Music, Video, Image as ImageIcon,
  Users, MessageSquare, Star, Heart, Zap, Target, Globe, MapPin, Clock,
  TrendingUp, Coins, Gem, Trophy, Sparkles, Lightbulb, Compass, Shield,
  Crown, Swords, GraduationCap, Landmark, Banknote, BarChart3, PieChart,
  Briefcase, Building, Factory, ShoppingCart, Truck, Plane, Ship, Train,
  Car, Mountain, TreePine, Waves, Sun, Moon, Cloud, Leaf, Flower2,
  Bird, Fish, Brain, Eye as EyeIcon, Rocket, Radio, Monitor, Laptop,
  Camera, Headphones, Database, Server, Terminal, Code, Search, Filter,
  Download, Upload, Link2, Share2, Clipboard, Flag, Map, Navigation,
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'FileText', label: 'Documento', Icon: FileText },
  { value: 'Play', label: 'Vídeo', Icon: Play },
  { value: 'Mic', label: 'Microfone', Icon: Mic },
  { value: 'Flame', label: 'Fogo', Icon: Flame },
  { value: 'Award', label: 'Prémio', Icon: Award },
  { value: 'BookOpen', label: 'Livro', Icon: BookOpen },
  { value: 'Music', label: 'Música', Icon: Music },
  { value: 'ImageIcon', label: 'Imagem', Icon: ImageIcon },
  { value: 'Users', label: 'Utilizadores', Icon: Users },
  { value: 'MessageSquare', label: 'Mensagem', Icon: MessageSquare },
  { value: 'Star', label: 'Estrela', Icon: Star },
  { value: 'Heart', label: 'Coração', Icon: Heart },
  { value: 'Zap', label: 'Raio', Icon: Zap },
  { value: 'Target', label: 'Alvo', Icon: Target },
  { value: 'Globe', label: 'Globo', Icon: Globe },
  { value: 'MapPin', label: 'Mapa', Icon: MapPin },
  { value: 'Clock', label: 'Relógio', Icon: Clock },
  { value: 'TrendingUp', label: 'Tendência', Icon: TrendingUp },
  { value: 'Coins', label: 'Moedas', Icon: Coins },
  { value: 'Gem', label: 'Gema', Icon: Gem },
  { value: 'Trophy', label: 'Taça', Icon: Trophy },
  { value: 'Sparkles', label: 'Brilho', Icon: Sparkles },
  { value: 'Lightbulb', label: 'Ideia', Icon: Lightbulb },
  { value: 'Compass', label: 'Bússola', Icon: Compass },
  { value: 'Shield', label: 'Escudo', Icon: Shield },
  { value: 'Crown', label: 'Coroa', Icon: Crown },
  { value: 'Swords', label: 'Espadas', Icon: Swords },
  { value: 'GraduationCap', label: 'Formatura', Icon: GraduationCap },
  { value: 'Landmark', label: 'Monumento', Icon: Landmark },
  { value: 'Banknote', label: 'Dinheiro', Icon: Banknote },
  { value: 'BarChart3', label: 'Gráfico', Icon: BarChart3 },
  { value: 'PieChart', label: 'Pie Chart', Icon: PieChart },
  { value: 'Briefcase', label: 'Negócios', Icon: Briefcase },
  { value: 'Building', label: 'Edifício', Icon: Building },
  { value: 'Factory', label: 'Fábrica', Icon: Factory },
  { value: 'ShoppingCart', label: 'Compras', Icon: ShoppingCart },
  { value: 'Truck', label: 'Caminhão', Icon: Truck },
  { value: 'Plane', label: 'Avião', Icon: Plane },
  { value: 'Ship', label: 'Navio', Icon: Ship },
  { value: 'Train', label: 'Comboio', Icon: Train },
  { value: 'Car', label: 'Carro', Icon: Car },
  { value: 'Mountain', label: 'Montanha', Icon: Mountain },
  { value: 'TreePine', label: 'Árvore', Icon: TreePine },
  { value: 'Waves', label: 'Ondas', Icon: Waves },
  { value: 'Sun', label: 'Sol', Icon: Sun },
  { value: 'Moon', label: 'Lua', Icon: Moon },
  { value: 'Cloud', label: 'Nuvem', Icon: Cloud },
  { value: 'Leaf', label: 'Folha', Icon: Leaf },
  { value: 'Flower2', label: 'Flor', Icon: Flower2 },
  { value: 'Bird', label: 'Pássaro', Icon: Bird },
  { value: 'Fish', label: 'Peixe', Icon: Fish },
  { value: 'Brain', label: 'Cérebro', Icon: Brain },
  { value: 'Eye', label: 'Olho', Icon: Eye },
  { value: 'Rocket', label: 'Foguete', Icon: Rocket },
  { value: 'Radio', label: 'Rádio', Icon: Radio },
  { value: 'Monitor', label: 'Ecrã', Icon: Monitor },
  { value: 'Laptop', label: 'Portátil', Icon: Laptop },
  { value: 'Camera', label: 'Câmara', Icon: Camera },
  { value: 'Headphones', label: 'Auscultadores', Icon: Headphones },
  { value: 'Database', label: 'Base Dados', Icon: Database },
  { value: 'Server', label: 'Servidor', Icon: Server },
  { value: 'Terminal', label: 'Terminal', Icon: Terminal },
  { value: 'Code', label: 'Código', Icon: Code },
  { value: 'Search', label: 'Pesquisa', Icon: Search },
  { value: 'Filter', label: 'Filtro', Icon: Filter },
  { value: 'Download', label: 'Download', Icon: Download },
  { value: 'Upload', label: 'Upload', Icon: Upload },
  { value: 'Link2', label: 'Ligação', Icon: Link2 },
  { value: 'Share2', label: 'Partilhar', Icon: Share2 },
  { value: 'Clipboard', label: 'Clipboard', Icon: Clipboard },
  { value: 'Folder', label: 'Pasta', Icon: Folder },
  { value: 'Flag', label: 'Bandeira', Icon: Flag },
  { value: 'Map', label: 'Mapa', Icon: Map },
  { value: 'Navigation', label: 'Navegação', Icon: Navigation },
];

const COLOR_OPTIONS = [
  '#E8B4B8', '#3A0310', '#ff6b35', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#ef4444', '#a855f7', '#22c55e', '#eab308', '#0ea5e9',
];

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  hidden: boolean;
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: 'Folder', color: '#E8B4B8', sortOrder: 0 });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setError('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    const interval = setInterval(fetchCategories, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) { setError('Nome obrigatório'); return; }
    setSaving(true);
    setError('');
    try {
      const url = editing ? `/api/categories/${editing.id}` : '/api/categories';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setIsModalOpen(false);
      setEditing(null);
      setFormData({ name: '', icon: 'Folder', color: '#E8B4B8', sortOrder: 0 });
      fetchCategories();
    } catch {
      setError('Erro ao guardar categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/categories/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      setError('Erro ao apagar categoria.');
    }
  };

  const handleToggleHidden = async (cat: Category) => {
    try {
      await fetch(`/api/categories/${cat.id}/toggle-hidden`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchCategories();
    } catch {
      setError('Erro ao alterar visibilidade.');
    }
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormData({ name: cat.name, icon: cat.icon, color: cat.color, sortOrder: cat.sortOrder });
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setFormData({ name: '', icon: 'Folder', color: '#E8B4B8', sortOrder: categories.length });
    setIsModalOpen(true);
  };

  const getIcon = (iconName: string) => {
    const found = ICON_OPTIONS.find(i => i.value === iconName);
    return found ? found.Icon : Folder;
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3A0310] border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
            <Folder className="w-6 h-6 text-white force-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Categorias</h1>
            <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">
              {categories.length} categoria(s)
            </p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#3A0310] text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#5A051A] transition-colors shadow-lg">
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 border-dashed">
          <Folder className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-600 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px]">Nenhuma categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const IconComp = getIcon(cat.icon);
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className={`bg-white dark:bg-white/5 rounded-2xl border p-4 flex flex-col items-center gap-3 group transition-all ${
                  cat.hidden
                    ? 'border-neutral-200 dark:border-white/10 opacity-50'
                    : 'border-neutral-200 dark:border-white/10 hover:border-[#3A0310]/50 dark:hover:border-[#E8B4B8]/50'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative" style={{ backgroundColor: cat.color + '20', border: `2px solid ${cat.color}` }}>
                  <IconComp className="w-6 h-6" style={{ color: cat.color }} />
                  {cat.hidden && (
                    <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                      <EyeOff className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-[#3A0310] dark:text-white text-center">{cat.name}</h3>
                <div className="flex gap-1.5">
                  <button onClick={() => handleToggleHidden(cat)} title={cat.hidden ? 'Mostrar' : 'Ocultar'}
                    className={`p-1.5 rounded-lg transition-colors ${cat.hidden ? 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20' : 'bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10'}`}>
                    {cat.hidden ? <Eye className="w-3.5 h-3.5 text-amber-500" /> : <EyeOff className="w-3.5 h-3.5 text-neutral-500" />}
                  </button>
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                  <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => { setIsModalOpen(false); setEditing(null); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black uppercase tracking-tight text-[#3A0310] dark:text-white">
                  {editing ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <button onClick={() => { setIsModalOpen(false); setEditing(null); }} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Name */}
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Nome</label>
              <input type="text" value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                className="w-full bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl py-3 px-4 text-neutral-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#3A0310] dark:focus:border-[#E8B4B8] transition-colors mb-4" />

              {/* Color */}
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Cor</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => setFormData(d => ({ ...d, color: c }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>

              {/* Icon */}
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 block">Ícone</label>
              <div className="grid grid-cols-8 gap-2 mb-4 max-h-48 overflow-y-auto p-1">
                {ICON_OPTIONS.map(({ value, label, Icon: Ic }) => (
                  <button key={value} onClick={() => setFormData(d => ({ ...d, icon: value }))}
                    title={label}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-center ${formData.icon === value ? 'border-[#3A0310] dark:border-[#E8B4B8] bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10' : 'border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5'}`}>
                    <Ic className="w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8]" />
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="flex items-center justify-center py-4 mb-4 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200 dark:border-white/10">
                {(() => { const Ic = getIcon(formData.icon); return <Ic className="w-6 h-6 mr-2" style={{ color: formData.color }} />; })()}
                <span className="text-sm font-black uppercase tracking-widest text-[#3A0310] dark:text-white">{formData.name || 'Nome'}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setIsModalOpen(false); setEditing(null); }}
                  className="flex-1 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving || !formData.name.trim()}
                  className="flex-1 py-3 rounded-2xl bg-[#3A0310] hover:bg-[#5A051A] text-white force-white font-black uppercase text-xs tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editing ? 'Guardar' : 'Criar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl text-center"
              onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white mb-2">Apagar Categoria</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-6">"{deleteTarget.name}" será removida permanentemente.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white force-white font-black uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" /> Apagar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
