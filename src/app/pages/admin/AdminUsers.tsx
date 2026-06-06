import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, Ban, Mail, Loader2, AlertTriangle, Trash2, ShieldCheck, ChevronDown, Check, Crown, Clock, XCircle, Bell } from "lucide-react";
import { ImageModal } from "../../components/ImageModal";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan?: string;
  profession: string;
  avatar?: string;
  createdAt: string;
};

const PLANS = [
  { value: "base", label: "Acesso Base", color: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { value: "elite", label: "Acesso Elite", color: "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { value: "admin", label: "Administrador", color: "bg-[#3A0310]/10 dark:bg-[#E8B4B8]/10 text-[#3A0310] dark:text-[#E8B4B8]" },
];

function getPlanLabel(plan?: string, role?: string) {
  if (role === "admin") return PLANS[2];
  if (plan === "elite") return PLANS[1];
  return PLANS[0]; // base por defeito
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [planDropdown, setPlanDropdown] = useState<string | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
  const [eliteRequests, setEliteRequests] = useState<any[]>([]);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  const fetchEliteRequests = async () => {
    try {
      const res = await fetch('/api/elite-requests');
      const data = await res.json();
      setEliteRequests(Array.isArray(data) ? data : []);
    } catch { /* ignorar */ }
  };

  const handleEliteAction = async (requestId: string, userId: string, action: 'approve' | 'reject') => {
    setProcessingRequest(requestId);
    try {
      await fetch(`/api/elite-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      // Atualizar estado local
      setEliteRequests(prev => prev.map(r =>
        r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
      ));
      if (action === 'approve') {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'elite', plan: 'elite' } : u));
      }
    } catch {
      setError('Erro ao processar pedido.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setError("Não foi possível carregar os utilizadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); fetchEliteRequests(); }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handler = () => setPlanDropdown(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredUsers = users.filter((u) =>
    u.role !== "admin" &&
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Erro ao remover utilizador.");
    } finally {
      setDeleting(false);
    }
  };

  const handlePlanChange = async (userId: string, newPlan: string) => {
    setUpdatingPlan(userId);
    setPlanDropdown(null);
    try {
      const newRole = newPlan; // newPlan can be "admin", "elite", "student" or "user"
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, plan: newPlan }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, plan: newPlan } : u));
    } catch {
      setError("Erro ao actualizar o plano.");
    } finally {
      setUpdatingPlan(null);
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#3A0310] border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
          <Users className="w-6 h-6 text-white force-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#3A0310] dark:text-white mb-0.5">Utilizadores</h1>
          <p className="text-[#3A0310]/70 dark:text-[#E8B4B8]/70 text-[10px] font-black uppercase tracking-widest">
            {users.length} utilizadores registados
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#3A0310]/60 dark:text-[#E8B4B8]/60" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-white/5 border-2 border-[#3A0310] dark:border-[#E8B4B8]/60 rounded-[1.5rem] shadow-md focus:ring-2 focus:ring-[#3A0310]/30 focus:border-[#3A0310] dark:focus:border-[#E8B4B8] transition-all text-neutral-800 dark:text-white placeholder-[#3A0310]/40 dark:placeholder-neutral-400 text-sm font-medium outline-none"
        />
      </div>

      {/* Elite Requests Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-400 dark:border-amber-500/40 rounded-[2rem] overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-4 bg-amber-400/10 dark:bg-amber-500/10 border-b border-amber-400/30 dark:border-amber-500/20">
          <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-black text-sm uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Pedidos de Acesso Elite
            </h3>
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500/80">
              {eliteRequests.filter(r => r.status === 'pending').length > 0
                ? `${eliteRequests.filter(r => r.status === 'pending').length} pedido(s) aguardam aprovação`
                : 'Sem pedidos pendentes'}
            </p>
          </div>
          <Crown className="w-5 h-5 text-amber-500" />
        </div>

        {eliteRequests.filter(r => r.status === 'pending').length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
            <Crown className="w-8 h-8 text-amber-300 dark:text-amber-700" />
            <p className="text-xs font-bold text-amber-600 dark:text-amber-500/60 uppercase tracking-widest">
              Nenhum pedido pendente
            </p>
          </div>
        ) : (
          <div className="divide-y divide-amber-200 dark:divide-amber-500/10">
            {eliteRequests.filter(r => r.status === 'pending').map(req => (
              <div key={req.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {req.avatar
                    ? <img src={req.avatar} alt={req.name} className="w-full h-full object-cover rounded-xl" />
                    : <span className="text-base font-black text-amber-700 dark:text-amber-400">{req.name?.charAt(0)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-neutral-800 dark:text-white truncate">{req.name}</p>
                  <p className="text-[10px] text-black dark:text-neutral-400 truncate">{req.email}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-black dark:text-amber-500" />
                    <span className="text-[9px] font-bold text-black dark:text-amber-400 uppercase tracking-wider">
                      {new Date(req.requestedAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEliteAction(req.id, req.userId, 'approve')}
                    disabled={processingRequest === req.id}
                    className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60"
                  >
                    {processingRequest === req.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Crown className="w-3.5 h-3.5" />}
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleEliteAction(req.id, req.userId, 'reject')}
                    disabled={processingRequest === req.id}
                    className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-400/40 font-black text-[10px] uppercase tracking-widest px-3 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user, index) => {
              const planInfo = getPlanLabel(user.plan, user.role);
              const isAdmin = user.role === "admin";
              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-center p-4 bg-white dark:bg-white/5 rounded-[1.5rem] border-2 border-[#3A0310] dark:border-[#E8B4B8] hover:border-[#3A0310]/80 dark:hover:border-[#E8B4B8]/80 transition-all gap-4 group shadow-md hover:shadow-lg"
                >
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 bg-gradient-to-br from-[#3A0310] to-[#5A051A] rounded-[1rem] flex items-center justify-center font-black text-lg force-white shadow-inner border border-[#E8B4B8]/20 shrink-0 overflow-hidden ${user.avatar ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    onClick={() => user.avatar && setSelectedImage(user.avatar)}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-black text-sm text-[#3A0310] dark:text-white uppercase tracking-tight break-words leading-tight">{user.name}</h3>
                      {isAdmin && (
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3A0310] dark:text-[#E8B4B8] shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-700 dark:text-neutral-400 font-bold truncate mb-2">{user.email}</p>

                    {/* Plan selector */}
                    <div className="relative" onMouseDown={e => e.stopPropagation()}>
                      <button
                        onClick={() => setPlanDropdown(planDropdown === user.id ? null : user.id)}
                        disabled={updatingPlan === user.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${planInfo.color} border-current/20 hover:opacity-80`}
                      >
                        {updatingPlan === user.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            {planInfo.label}
                            <ChevronDown className="w-3 h-3 opacity-60" />
                          </>
                        )}
                      </button>

                      <AnimatePresence>
                        {planDropdown === user.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.95 }}
                            className="absolute bottom-full mb-1 left-0 w-44 bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                          >
                            {PLANS.map(plan => (
                              <button
                                key={plan.value}
                                onClick={() => handlePlanChange(user.id, plan.value)}
                                className="w-full flex items-center justify-between px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors text-neutral-800 dark:text-white"
                              >
                                <span className={`px-2 py-0.5 rounded-md ${plan.color}`}>{plan.label}</span>
                                {((user.plan === plan.value) || (!user.plan && plan.value === "base") || (isAdmin && plan.value === "admin")) && (
                                  <Check className="w-3.5 h-3.5 text-[#3A0310] dark:text-[#E8B4B8]" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <a
                      href={`mailto:${user.email}`}
                      title="Enviar email"
                      className="p-2.5 text-[#3A0310] dark:text-[#E8B4B8] bg-[#3A0310]/5 dark:bg-[#E8B4B8]/10 hover:bg-[#3A0310] hover:text-white dark:hover:bg-[#E8B4B8]/30 rounded-xl transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      title="Remover utilizador"
                      className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white dark:hover:bg-red-500/30 rounded-xl transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredUsers.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full text-center py-16 bg-white/50 dark:bg-white/5 rounded-[2rem] border border-neutral-200 dark:border-white/10 border-dashed">
              <Users className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-widest text-[10px]">
                {search ? "Nenhum utilizador encontrado." : "Ainda não há utilizadores registados."}
              </p>
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
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-[#1A0A0D] border border-neutral-200 dark:border-[#3A0310]/60 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-black text-center text-neutral-900 dark:text-white uppercase tracking-tight mb-2">Remover Utilizador?</h2>
              <p className="text-center text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-1">Esta ação é irreversível. Vai remover:</p>
              <p className="text-center font-black text-[#3A0310] dark:text-[#E8B4B8] text-sm uppercase tracking-tight mb-1">{deleteTarget.name}</p>
              <p className="text-center text-neutral-500 text-xs mb-8">{deleteTarget.email}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-black uppercase text-xs tracking-widest hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                <button onClick={handleDeleteConfirm} disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting ? "A Remover..." : "Remover"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />
    </div>
  );
}
