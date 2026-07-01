import React, { useState, useRef, useEffect } from "react";
import { useNavigate, MemoryRouter } from "react-router";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  LogOut, 
  Star,
  CheckCircle2,
  Settings,
  Crown,
  History,
  Award,
  Camera,
  Loader2,
  Bookmark,
  BookOpen,
  Edit2,
  Check,
  X,
  ChevronDown
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ImageModal } from "../components/ImageModal";

export function Profile() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const storedUser = userStr ? JSON.parse(userStr) : { name: "Estudante", role: "student" };
  const [user, setUser] = useState(storedUser);

  const [avatar, setAvatar] = useState<string | null>(storedUser.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [stats, setStats] = useState({ xp: 0, temas: 0, rank: '-' });
  const [completedStudies, setCompletedStudies] = useState<any[]>([]);

  const PROFESSIONS = [
    { value: 'Estudante', label: 'Estudante' },
    { value: 'Docente', label: 'Docente' },
    { value: 'Trabalhador', label: 'Trabalhador' },
  ];

  const [profileName, setProfileName] = useState(storedUser.name || "Estudante");
  const [profileProfession, setProfileProfession] = useState(storedUser.profession || 'Estudante');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(profileName);
  const [tempProfession, setTempProfession] = useState(profileProfession);
  const [savingProfile, setSavingProfile] = useState(false);

  // Buscar role actualizado do servidor (actualização feita pelo admin)
  useEffect(() => {
    if (!storedUser.id) return;
    const fetchRole = async () => {
      try {
        const res = await fetch(`/api/users/${storedUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.role) {
            const updatedUser = { ...storedUser, role: data.role };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        }
      } catch {}
    };
    fetchRole();
    const interval = setInterval(fetchRole, 30000);
    return () => clearInterval(interval);
  }, [storedUser.id]);

  // Estado do pedido de Elite
  const [eliteRequest, setEliteRequest] = useState<{ status: string | null, rejectionReason?: string }>({ status: null });
  const [requestingElite, setRequestingElite] = useState(false);

  useEffect(() => {
    if (!storedUser.id) return;
    const fetchElite = async () => {
      try {
        const res = await fetch(`/api/elite-requests/user/${storedUser.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.status) {
            setEliteRequest({
              status: data.status,
              rejectionReason: data.rejectionReason || data.rejection_reason || undefined,
            });
          } else {
            setEliteRequest({ status: null });
          }
        }
      } catch {}
    };
    fetchElite();
    const interval = setInterval(fetchElite, 30000);
    return () => clearInterval(interval);
  }, [storedUser.id]);

  const handleEliteRequest = async () => {
    if (!storedUser.id || requestingElite) return;
    setRequestingElite(true);
    try {
      const res = await fetch('/api/elite-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: storedUser.id }),
      });
      const data = await res.json();
      if (data.success) {
        setEliteRequest({ status: 'pending' });
        toast.success('Pedido enviado!', { description: 'O teu pedido de Elite foi enviado. Aguarda a aprovação do admin.' });
      }
    } catch {
      toast.error('Erro ao enviar pedido. Tenta novamente.');
    } finally {
      setRequestingElite(false);
    }
  };

  const handleCancelEliteRequest = async () => {
    if (!storedUser.id || requestingElite) return;
    setRequestingElite(true);
    try {
      await fetch(`/api/elite-requests/user/${storedUser.id}`, { method: 'DELETE' });
      setEliteRequest({ status: null });
      toast.success('Pronto!', { description: 'O pedido foi removido do sistema.' });
    } catch {
      toast.error('Erro ao remover pedido.');
    } finally {
      setRequestingElite(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${storedUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName, profession: tempProfession }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProfileName(updated.name || tempName);
      setProfileProfession(updated.profession || tempProfession);
      const updatedUser = { ...user, name: updated.name || tempName, profession: updated.profession || tempProfession };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingProfile(false);
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Erro ao guardar. Tente novamente.');
    } finally {
      setSavingProfile(false);
    }
  };

  React.useEffect(() => {
    if (!user?.id) return;
    const fetchSaved = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}/saved`);
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
      } catch { setFavorites([]); }
    };
    fetchSaved();
    const interval = setInterval(fetchSaved, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  React.useEffect(() => {
    if (!user.id) return;
    const fetchStats = async () => {
      try {
        const [statsRes, completedRes] = await Promise.all([
          fetch(`/api/users/${user.id}/stats`),
          fetch(`/api/users/${user.id}/completed`),
        ]);
        const statsData = await statsRes.json();
        const completedData = await completedRes.json();
        if (!statsData.error) setStats(statsData);
        if (Array.isArray(completedData)) setCompletedStudies(completedData);
      } catch (err) { console.error(err); }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError("");

    // Converter para base64 imediatamente (fallback local)
    const toBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    try {
      // Tentar API com timeout de 8 segundos
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const fd = new FormData();
      fd.append("file", file);

      let avatarUrl: string | null = null;
      try {
        const res = await fetch(`/api/users/${user.id}/avatar`, {
          method: "PUT",
          body: fd,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          avatarUrl = data.avatar;
        }
      } catch {
        clearTimeout(timeout);
        // API falhou ou expirou — usar base64 local
      }

      // Se API não devolveu URL válida, usar base64
      if (!avatarUrl) {
        avatarUrl = await toBase64(file);
      }

      setAvatar(avatarUrl);
      const updatedUser = { ...user, avatar: avatarUrl };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err: any) {
      setAvatarError("Erro ao carregar foto. Tenta novamente.");
    } finally {
      setUploadingAvatar(false);
    }
  };


  const options = [
    { icon: Shield, label: "Segurança de Conta", sublabel: "Mudar Senha", path: "/change-password" },
  ];

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300 md:max-w-5xl md:mx-auto md:px-6">
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative px-6 pt-8 pb-20 md:pb-10 overflow-hidden md:rounded-[2.5rem] md:mt-6 shadow-2xl border border-[#3A0310]/10 dark:border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A0310] via-[#2A020B] to-[#140105]"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#3A0310] rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10 flex flex-col md:grid md:grid-cols-12 md:gap-12 md:items-center">
          
          {/* Profile Basic Info Column */}
          <div className="flex flex-col items-center md:items-start md:col-span-5 mb-8 md:mb-0">
            <div className="relative mb-5">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div 
                className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-white/5 p-1.5 backdrop-blur-xl border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.4)] overflow-hidden ${avatar ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                onClick={() => avatar && setSelectedImage(avatar)}
              >
                {avatar ? (
                  <img src={avatar} alt={user.name} className="w-full h-full rounded-[1.5rem] object-cover" />
                ) : (
                  <div className="w-full h-full rounded-[1.5rem] bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center">
                    <span className="text-3xl font-black force-white">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#3A0310] text-white px-3 py-1.5 rounded-full shadow-2xl border border-[#E8B4B8]/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap z-10"
              >
                {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">Alterar foto</span>
              </button>
            </div>
            {avatarError && <p className="text-red-400 text-[10px] font-bold mb-2 text-center">{avatarError}</p>}
            <div className="flex flex-col items-center md:items-start w-full relative">
              {isEditingProfile ? (
                <div className="w-full flex flex-col items-center md:items-start gap-2 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="O seu nome"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 force-white font-black tracking-tighter text-center md:text-left focus:outline-none focus:border-[#E8B4B8]/50"
                  />
                  <div className="relative w-full">
                    <select
                      value={tempProfession}
                      onChange={(e) => setTempProfession(e.target.value)}
                      className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-3 py-2 force-gold font-bold text-[10px] uppercase tracking-[0.2em] text-center md:text-left focus:outline-none focus:border-[#E8B4B8]/50 cursor-pointer pr-8"
                      style={{ color: '#E8B4B8' }}
                    >
                      {PROFESSIONS.map(p => (
                        <option key={p.value} value={p.value} style={{ background: '#1A0A0D', color: '#E8B4B8' }}>{p.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#E8B4B8' }} />
                  </div>
                  <div className="flex gap-2 mt-2 w-full justify-center md:justify-start">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="bg-green-500/20 text-green-400 p-2 rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setTempName(profileName);
                        setTempProfession(profileProfession);
                        setIsEditingProfile(false);
                      }}
                      className="bg-red-500/20 text-red-400 p-2 rounded-xl hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative flex flex-col items-center md:items-start max-w-full">
                  <div className="flex items-center gap-3 justify-center md:justify-start w-full">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-0.5 text-center md:text-left force-white">
                      {profileName}
                    </h2>
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 force-white transition-all shadow-lg active:scale-95 flex-shrink-0"
                        title="Editar Perfil"
                      >
                        <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5 force-white" />
                      </button>
                      <span className="text-[7px] font-black uppercase tracking-wider force-white opacity-60 whitespace-nowrap">Editar perfil</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-start mt-1">
                    <p className="font-bold text-[9px] uppercase tracking-[0.2em] text-center md:text-left force-gold">
                      {profileProfession}
                    </p>
                    {user.role && user.role !== 'student' && user.role !== 'user' && (
                      <span className={`mt-1 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        user.role === 'admin' ? 'bg-[#3A0310]/20 text-[#E8B4B8] border-[#E8B4B8]/30' :
                        user.role === 'escritor' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                        user.role === 'revisor' ? 'bg-violet-500/20 text-violet-300 border-violet-400/30' :
                        user.role === 'elite' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                        'bg-white/10 text-white/70 border-white/20'
                      }`}>
                        {user.role === 'admin' && '🛡️ Administrador'}
                        {user.role === 'escritor' && '✍️ Escritor'}
                        {user.role === 'revisor' && '👁️ Revisor'}
                        {user.role === 'elite' && '⭐ Membro Elite'}
                      </span>
                    )}
                    {user.email && (
                      <p className="text-[10px] font-medium text-white/70 lowercase tracking-wide text-center md:text-left mt-0.5 force-white opacity-70">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Stats Grid Column */}
          <div className="w-full md:col-span-7">
            <div className={`grid gap-3 ${stats.rank !== '-' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
              {stats.rank !== '-' && (
                <div className="bg-[#3A0310]/30 backdrop-blur-md border-2 p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <Award className="w-4 h-4 force-white mb-1.5" />
                  <span className="font-black text-base md:text-lg force-white">#{stats.rank}</span>
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest force-gold">Ranking</span>
                </div>
              )}

              <button
                onClick={() => navigate('/app/completed')}
                className="bg-[#3A0310]/30 backdrop-blur-md border-2 p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-colors hover:bg-white/5 active:scale-[0.97] group text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <BookOpen className="w-4 h-4 force-white mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
                <span className="font-black text-[8px] md:text-[9px] uppercase tracking-widest force-white leading-tight mb-0.5">Estudos Concluídos</span>
                <span className="text-[8px] font-medium force-white opacity-60">{completedStudies.length} concluídos</span>
              </button>

              <button
                onClick={() => navigate('/app/saved')}
                className="bg-[#3A0310]/30 backdrop-blur-md border-2 p-3 md:p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-colors hover:bg-white/5 active:scale-[0.97] group text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Bookmark className="w-4 h-4 force-white mb-1.5 group-hover:-translate-y-0.5 transition-transform" />
                <span className="font-black text-[8px] md:text-[9px] uppercase tracking-widest force-white leading-tight mb-0.5">Guardados</span>
                <span className="text-[8px] font-medium force-white opacity-60">{favorites.length} guardados</span>
              </button>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Main Content Area: Responsive Two-column on PC, Single-column on Mobile */}
      <div className="px-6 -mt-8 md:mt-8 relative z-20 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 w-full">
        
        {/* Left Column: Plan & Logout */}
        <div className="md:col-span-6 space-y-6 flex flex-col justify-between">
          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[2rem] bg-gradient-to-br from-[#3A0310]/95 via-[#2A020B] to-[#140105] overflow-hidden shadow-2xl group border border-[#E8B4B8]/20 flex-1 flex flex-col justify-center"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#3A0310]"></div>
            
            <AnimatePresence mode="wait">
              {!['elite', 'admin', 'escritor', 'revisor'].includes(user.role) ? (
                <motion.div 
                   key="free-plan"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="p-6 md:p-8"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight force-white">Membro Base</h3>
                    </div>
                  </div>
                  
                  <p className="text-xs md:text-sm mb-6 leading-relaxed font-medium force-white opacity-90">
                    Desbloqueia o arquivo completo e os círculos de debate exclusivos fazendo upgrade para a elite.
                  </p>
                  
                  {eliteRequest.status === 'pending' ? (
                    <div className="space-y-3">
                      <div className="w-full bg-amber-500/10 border border-amber-500/40 py-4 rounded-xl flex justify-center items-center gap-2">
                        <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                        <span className="font-black text-xs uppercase tracking-widest text-amber-400">Pedido Pendente para Elite</span>
                      </div>
                      <button
                        onClick={handleCancelEliteRequest}
                        disabled={requestingElite}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex justify-center items-center border border-red-500/20 disabled:opacity-60"
                      >
                        Cancelar Pedido
                      </button>
                    </div>
                  ) : eliteRequest.status === 'rejected' ? (
                    <div className="space-y-3">
                      <div className="w-full bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <X className="w-4 h-4 text-red-400" />
                          <span className="font-black text-xs uppercase tracking-widest text-red-400">Pedido Rejeitado</span>
                        </div>
                        {eliteRequest.rejectionReason && (
                          <p className="text-xs text-red-200/80 font-medium p-3 bg-red-950/40 rounded-lg border border-red-500/20 text-left">
                            <strong className="block text-red-400 mb-1">Motivo do Administrador:</strong>
                            {eliteRequest.rejectionReason}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleCancelEliteRequest}
                        disabled={requestingElite}
                        className="w-full bg-[#3A0310] force-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-[#5A051A] transition-all active:scale-[0.98] flex justify-center items-center border border-[#E8B4B8]/20 disabled:opacity-60"
                      >
                        OK, Entendi
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleEliteRequest}
                      disabled={requestingElite}
                      className="w-full bg-[#3A0310] force-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-[#5A051A] transition-all active:scale-[0.98] flex justify-center items-center group/btn border border-[#E8B4B8]/20 disabled:opacity-60"
                    >
                      {requestingElite
                        ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        : <Crown className="w-4 h-4 mr-2 group-hover/btn:-translate-y-0.5 group-hover/btn:text-amber-500 transition-all force-gold" />}
                      Ascender à Elite
                    </button>
                  )}
                </motion.div>
              ) : (
                 <motion.div 
                    key="premium-plan"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative p-6 md:p-8"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3A0310] to-black opacity-40 -z-10 group-hover:scale-110 transition-transform duration-1000"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] block mb-1.5 force-gold">
                          Status de Prestígio
                        </span>
                        <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight force-white">
                          <Crown className="w-5 h-5 text-amber-500 fill-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" /> Membro Elite
                        </h3>
                      </div>
                      <div className="bg-[#3A0310] text-[8px] font-black px-2.5 py-1 rounded-full border border-[#E8B4B8]/30 uppercase tracking-widest force-gold">
                        Vigoroso
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {[
                        'Acesso Total ao Arquivo Histórico',
                        'Círculos de Debate Exclusivos',
                        'Suporte Académico Prioritário'
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center text-[10px] font-bold uppercase tracking-tight force-white opacity-90">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
                          {feat}
                        </div>
                      ))}
                    </div>
                    
                  </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Logout Button */}
          <div className="w-full md:pb-4">
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");
              }}
              className="w-full flex items-center justify-center gap-2.5 py-4 text-[#3A0310] dark:text-[#E8B4B8]/60 font-black uppercase tracking-widest text-[9px] bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Terminar Sessão
            </button>
          </div>
        </div>

        {/* Right Column: Menu Options */}
        <div className="md:col-span-6 space-y-6 w-full">
          <div className="space-y-3">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] px-2 text-neutral-400 dark:text-neutral-500">Configurações de Arquivo</h3>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-neutral-100 dark:border-white/5 overflow-hidden divide-y divide-neutral-100 dark:divide-white/5 shadow-xl">
            {options.map((item, index) => (
              <button 
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className="w-full flex items-center justify-between p-4.5 md:p-5 hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-all group active:bg-neutral-100 dark:active:bg-white/[0.05]"
              >
                <div className="flex items-center gap-4 text-neutral-700 dark:text-neutral-300 font-bold uppercase tracking-tighter transition-colors group-hover:text-[#3A0310] dark:group-hover:text-white">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center border border-neutral-200/50 dark:border-white/5 group-hover:bg-[#3A0310]/15 dark:group-hover:bg-[#3A0310]/20 group-hover:border-[#3A0310]/40 transition-all">
                    <item.icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] transition-colors" />
                  </div>
                  <div>
                    <span className="text-xs md:text-sm block">{item.label}</span>
                    {item.sublabel && <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal normal-case">{item.sublabel}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-700 group-hover:text-[#3A0310] dark:group-hover:text-[#E8B4B8] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>



      <ImageModal 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
        imageUrl={selectedImage || ''} 
      />
    </div>
  );
}

export default function ProfilePreview() {
  return (
    <MemoryRouter>
      <Profile />
    </MemoryRouter>
  );
}
