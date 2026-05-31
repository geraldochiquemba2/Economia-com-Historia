import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, Ban, Mail, Loader2, AlertTriangle, Trash2, ShieldCheck } from "lucide-react";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  profession: string;
  createdAt: string;
};

export function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
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

  const professionColor = (p: string) => {
    if (p === "Docente") return "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300";
    if (p === "Trabalhador") return "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300";
    return "bg-neutral-200 dark:bg-white/5 text-neutral-900 dark:text-neutral-300";
  };

  return (
    <div className="p-6 pb-24 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#3A0310] border border-[#3A0310]/20 dark:border-[#E8B4B8]/30 flex items-center justify-center shadow-lg">
          <Users className="w-6 h-6 text-white" />
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
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Pesquisar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-[1.5rem] shadow-md focus:ring-2 focus:ring-[#3A0310]/30 focus:border-[#3A0310] transition-all text-neutral-800 dark:text-white placeholder-neutral-400 text-xs font-bold uppercase tracking-wider outline-none"
        />
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-[#3A0310] dark:text-[#E8B4B8]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center p-4 bg-white dark:bg-white/5 rounded-[1.5rem] border border-[#3A0310]/20 dark:border-white/10 hover:border-[#3A0310]/50 dark:hover:border-[#E8B4B8]/30 transition-all gap-4 group shadow-md hover:shadow-lg"
              >
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#3A0310] to-[#5A051A] rounded-[1rem] flex items-center justify-center font-black text-lg text-white shadow-inner border border-[#E8B4B8]/20 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black text-sm text-[#3A0310] dark:text-white uppercase tracking-tight break-words leading-tight">{user.name}</h3>
                    {user.role === "admin" && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[#3A0310] dark:text-[#E8B4B8] shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-700 dark:text-neutral-400 font-bold truncate mb-1.5">{user.email}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${professionColor(user.profession)}`}>
                      {user.profession || "Estudante"}
                    </span>
                    <span className="text-[10px] font-black text-neutral-900 dark:text-neutral-400 uppercase tracking-widest">
                      Plano Gratuito
                    </span>
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
            ))}
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
    </div>
  );
}
