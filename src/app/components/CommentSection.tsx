import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, CornerDownRight, Send, Lock, Loader2, Pencil, Trash2, EyeOff, Eye, Check, X, ShieldAlert, ThumbsUp, ThumbsDown, ListFilter, Crown, Shield, AlertTriangle } from "lucide-react";
import { Link } from "react-router";

// ─── Types ───────────────────────────────────────────────────────────────────
export type Comment = {
  id: string;
  author: string;
  avatar: string | null;
  userId?: string;
  text: string;
  createdAt: string;
  editedAt?: string | null;
  isHidden?: boolean;
  moderatorNote?: string | null;
  parentId: string | null;
  likes?: string[];
  dislikes?: string[];
  replies: Comment[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  // Garantir que a data é corretamente lida como UTC, mesmo se o Postgres omitir o Z
  let safeDateStr = dateStr.replace(' ', 'T');
  if (!safeDateStr.includes('Z') && !safeDateStr.match(/[+-]\d\d:\d\d$/)) {
    safeDateStr += 'Z';
  }
  const now = Date.now();
  const then = new Date(safeDateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  
  if (diff < 0) return "Agora mesmo"; // Proteção contra pequenos dessincronismos de relógio
  if (diff < 60) return "Agora mesmo";
  
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `há ${mins} minuto${mins === 1 ? '' : 's'}`;
  }
  
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `há ${hours} hora${hours === 1 ? '' : 's'}`;
  }
  
  const days = Math.floor(diff / 86400);
  return `há ${days} dia${days === 1 ? '' : 's'}`;
}

// ─── CommentNode ─────────────────────────────────────────────────────────────
type CommentNodeProps = {
  comment: Comment;
  depth?: number;
  parentId?: string;
  currentUserId?: string;
  currentUserRole?: string;
  token?: string;
  replyingToId?: string | null;
  handleReply: (id: string, author: string) => void;
  onUpdate: (updated: Comment) => void;
  onDelete: (id: string) => void;
  expandedReplies: Record<string, number>;
  onExpand: (id: string, total: number, currentVisible: number) => void;
  onCollapse: (id: string) => void;
  parentHidden?: boolean;
};

const CommentNode = ({
  comment,
  depth = 0,
  parentId,
  currentUserId,
  currentUserRole,
  token,
  replyingToId,
  handleReply,
  onUpdate,
  onDelete,
  expandedReplies,
  onExpand,
  onCollapse,
  parentHidden = false,
}: CommentNodeProps) => {
  const isTopLevel = depth === 0;
  const defaultVisible = depth === 0 ? 2 : 1;
  const visibleCount = expandedReplies[comment.id] || defaultVisible;
  const totalReplies = comment.replies?.length || 0;
  const remaining = totalReplies - visibleCount;
  const threadId = depth >= 2 ? (parentId ?? comment.id) : comment.id;

  const isOwner = currentUserId && comment.userId === currentUserId;
  const isAdmin = currentUserRole === "admin";

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [saving, setSaving] = useState(false);
  const [showHideForm, setShowHideForm] = useState(false);
  const [moderatorNote, setModeratorNote] = useState(comment.moderatorNote || "");
  const [loadingAction, setLoadingAction] = useState(false);
  
  const isBeingReplied = replyingToId === threadId;
  
  // Se o pai estiver oculto, este nó também está efetivamente oculto
  const effectivelyHidden = comment.isHidden || parentHidden;


  const handleSaveEdit = async () => {
    if (!editText.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ text: editText.trim() }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      onUpdate({ ...comment, text: updated.text, editedAt: updated.editedAt });
      setEditing(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Tens a certeza que queres apagar este comentário?")) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/delete`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) onDelete(comment.id);
    } catch (e) { console.error(e); }
    finally { setLoadingAction(false); }
  };

  const handleToggleHide = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/hide`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ hide: !comment.isHidden, moderatorNote }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      onUpdate({ ...comment, isHidden: updated.isHidden, moderatorNote: updated.moderatorNote });
      setShowHideForm(false);
    } catch (e) { console.error(e); }
    finally { setLoadingAction(false); }
  };

  const handleReact = async (type: 'like' | 'dislike') => {
    if (!currentUserId || !token) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      onUpdate({ ...comment, likes: updated.likes, dislikes: updated.dislikes });
    } catch (e) { console.error(e); }
    finally { setLoadingAction(false); }
  };

  return (
    <motion.div
      id={`comment-${comment.id}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={
        isTopLevel
          ? `p-3 rounded-2xl border transition-all relative overflow-hidden shadow-sm ${
              effectivelyHidden
                ? "bg-amber-200 dark:bg-amber-500/30 border-amber-500/60 dark:border-amber-400/50"
                : "bg-white dark:bg-white/5 " + (isBeingReplied
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-[#3A0310] dark:border-[#E8B4B8]/30 hover:border-[#5A051A] dark:hover:border-[#E8B4B8]/60")
            }`
          : `relative group/reply pb-4 mb-4 border-b-2 border-solid border-[#3A0310]/40 dark:border-white/20 last:border-0 last:mb-0 last:pb-0 transition-all ${
              effectivelyHidden ? "bg-amber-200 dark:bg-amber-500/30 -mx-2 px-2 rounded-xl" :
              (isBeingReplied ? "bg-blue-50/50 dark:bg-blue-900/10 -mx-2 px-2 rounded-xl" : "")
            }`
      }
    >
      {!isTopLevel && (
        <div className="absolute -left-6 top-3 w-4 h-0.5 bg-[#3A0310] dark:bg-[#E8B4B8] rounded-r-full" />
      )}

      {/* Admin hidden badge */}
      {effectivelyHidden && (isAdmin || isOwner) && (
        <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-amber-500 dark:bg-amber-400/10 rounded-lg border border-amber-500 dark:border-amber-400/20">
          <ShieldAlert className="w-3 h-3 text-white dark:text-amber-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white dark:text-amber-500">Oculto pelo admin</span>
          {comment.moderatorNote && <span className="text-[9px] text-black dark:text-amber-400 font-bold italic">· Motivo: {comment.moderatorNote}</span>}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {comment.avatar ? (
            <img src={comment.avatar} alt={comment.author}
              className={`${isTopLevel ? "w-7 h-7 rounded-xl" : "w-5 h-5 rounded-lg"} object-cover border border-white/10 flex-shrink-0`}
            />
          ) : (
            <div
              className={`${isTopLevel ? "w-7 h-7 rounded-xl text-[10px]" : "w-5 h-5 rounded-lg text-[8px]"} bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center font-black border border-white/10 uppercase flex-shrink-0`}
              style={{ color: "#E8B4B8" }}
            >
              {comment.author.charAt(0)}
            </div>
          )}
          <div>
            <span className={`font-bold text-neutral-800 dark:text-white block leading-none ${isTopLevel ? "text-xs" : "text-[10px]"}`}>
              {comment.author}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={`text-neutral-500 dark:text-neutral-400 font-black uppercase tracking-widest ${isTopLevel ? "text-[9px]" : "text-[7px]"}`}>
                {timeAgo(comment.createdAt)}
              </span>
              {comment.editedAt && (
                <span className="text-[7px] font-black uppercase tracking-widest bg-neutral-200 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 px-1.5 py-0.5 rounded-full">
                  Editado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {isOwner && !editing && !effectivelyHidden && (
            <button onClick={() => { setEditing(true); setEditText(comment.text); }}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-all"
              title="Editar">
              <Pencil className="w-3 h-3" />
            </button>
          )}
          {(isOwner || isAdmin) && (
            <button onClick={handleDelete} disabled={loadingAction}
              className={`p-1.5 rounded-lg transition-all ${effectivelyHidden ? "text-white hover:bg-white/20" : "hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500"}`}
              title="Eliminar">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setShowHideForm(v => !v)} disabled={loadingAction}
              className={`p-1.5 rounded-lg transition-all ${effectivelyHidden ? "text-white hover:bg-white/20" : "text-neutral-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"}`}
              title={comment.isHidden ? "Mostrar" : "Ocultar"}>
              {comment.isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Admin hide form */}
      <AnimatePresence>
        {showHideForm && isAdmin && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mb-2 p-2 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 overflow-hidden">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-1.5">
              {comment.isHidden ? "Repor comentário" : "Ocultar comentário"}
            </p>
            <input
              value={moderatorNote}
              onChange={e => setModeratorNote(e.target.value)}
              placeholder="Motivo (opcional)..."
              className="w-full text-xs bg-white dark:bg-black/30 border border-amber-200 dark:border-amber-500/30 rounded-lg px-2 py-1.5 text-neutral-700 dark:text-white placeholder-neutral-400 focus:outline-none mb-2"
            />
            <div className="flex gap-2">
              <button onClick={handleToggleHide} disabled={loadingAction}
                className="flex-1 text-[9px] font-black uppercase tracking-widest py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all">
                {comment.isHidden ? "Repor" : "Ocultar"}
              </button>
              <button onClick={() => setShowHideForm(false)}
                className="flex-1 text-[9px] font-black uppercase tracking-widest py-1.5 rounded-lg bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/20 transition-all">
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit mode */}
      {editing ? (
        <div className="mt-1">
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={2}
            className="w-full text-sm bg-neutral-50 dark:bg-white/5 border border-[#3A0310]/30 dark:border-[#E8B4B8]/20 rounded-xl px-3 py-2 text-neutral-800 dark:text-white resize-none focus:outline-none focus:border-[#3A0310] dark:focus:border-[#E8B4B8]"
          />
          <div className="flex justify-end gap-2 mt-1.5">
            <button onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600 px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-all">
              <X className="w-3 h-3" /> Cancelar
            </button>
            <button onClick={handleSaveEdit} disabled={saving || !editText.trim()}
              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#3A0310,#5A051A)", color: "#ffffff" }}>
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <p className={`text-neutral-700 dark:text-neutral-200 font-medium leading-snug ${isTopLevel ? "text-sm" : "text-xs"} whitespace-pre-wrap`}>
          {effectivelyHidden && !isAdmin && !isOwner ? (
            <span className="italic text-amber-600 dark:text-amber-500 font-black uppercase tracking-widest text-[10px]">Ocultado pelo Admin</span>
          ) : (
            comment.text.split(/(@[a-zA-Z0-9_]+)/g).map((part, i) => 
              part.startsWith('@') ? <span key={i} className="text-blue-600 dark:text-blue-400 font-bold">{part}</span> : part
            )
          )}
        </p>
      )}

      {/* Reply and Reactions */}
      {!editing && !effectivelyHidden && (
        <div className={`mt-1 flex items-center justify-between ${isTopLevel ? "pt-2 border-t border-[#3A0310]/10 dark:border-white/10" : ""}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleReact('like')}
              disabled={loadingAction || !currentUserId}
              className={`flex items-center gap-1.5 transition-colors ${comment.likes?.includes(currentUserId || '') ? "text-blue-600 dark:text-blue-400" : "text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
              title="Gosto"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${comment.likes?.includes(currentUserId || '') ? "fill-current" : ""}`} />
              <span className="text-[10px] font-bold">{comment.likes?.length || 0}</span>
            </button>
            <button
              onClick={() => handleReact('dislike')}
              disabled={loadingAction || !currentUserId}
              className={`flex items-center gap-1.5 transition-colors ${comment.dislikes?.includes(currentUserId || '') ? "text-red-600 dark:text-red-400" : "text-neutral-400 hover:text-red-600 dark:hover:text-red-400"}`}
              title="Não Gosto"
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${comment.dislikes?.includes(currentUserId || '') ? "fill-current" : ""}`} />
              <span className="text-[10px] font-bold">{comment.dislikes?.length || 0}</span>
            </button>
          </div>

          <button
            onClick={() => handleReply(threadId, comment.author)}
            className={`flex items-center gap-1 font-black uppercase tracking-widest text-[#3A0310] dark:text-[#E8B4B8] transition-opacity ${
              isTopLevel ? "opacity-70 hover:opacity-100 gap-1.5 text-[10px]" : "text-[9px] opacity-70 hover:opacity-100"
            }`}
          >
            <CornerDownRight className={isTopLevel ? "w-3.5 h-3.5" : "w-3 h-3"} />
            Responder
          </button>
        </div>
      )}

      {/* Nested Replies — apenas visíveis se o comentário não está oculto */}
      {comment.replies && comment.replies.length > 0 && depth < 2 && !effectivelyHidden && (
        <div className="mt-3 pt-3 relative">
          <div className="absolute left-[15px] top-0 bottom-4 w-0.5 bg-[#3A0310] dark:bg-[#E8B4B8] rounded-full" />
          <div className="space-y-2 pl-10 md:pl-12">
            {comment.replies.slice(0, visibleCount).map((reply) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                parentId={threadId}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                token={token}
                replyingToId={replyingToId}
                handleReply={handleReply}
                onUpdate={onUpdate}
                onDelete={onDelete}
                expandedReplies={expandedReplies}
                onExpand={onExpand}
                onCollapse={onCollapse}
                parentHidden={effectivelyHidden}
              />
            ))}
            {totalReplies > defaultVisible && (
              <div className="pt-2 flex flex-col items-start gap-2 relative z-10">
                {remaining > 0 && (
                  <button onClick={() => onExpand(comment.id, totalReplies, visibleCount)}
                    className="text-[9px] font-black text-[#3A0310] dark:text-[#E8B4B8] uppercase tracking-widest hover:underline flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3" /> Ver mais {Math.min(remaining, 5)}{" "}
                    {Math.min(remaining, 5) === 1 ? "resposta" : "respostas"}
                  </button>
                )}
                {remaining <= 0 && (
                  <button onClick={() => onCollapse(comment.id)}
                    className="text-[9px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest hover:underline">
                    Minimizar respostas
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Indicador de respostas comprimidas quando oculto */}
      {comment.replies && comment.replies.length > 0 && effectivelyHidden && (isAdmin || isOwner) && (
        <div className="mt-2 pl-3 border-l-2 border-amber-400/40">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 italic">
            {comment.replies.length} resposta{comment.replies.length !== 1 ? 's' : ''} comprimida{comment.replies.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ─── CommentSection ───────────────────────────────────────────────────────────
type CommentSectionProps = {
  contentId?: string;
  contentType?: string;
  title?: string;
  placeholder?: string;
  className?: string;
};

export function CommentSection({ contentId, contentType, title = "Discussões", placeholder = "Contribuir para o debate...", className = "" }: CommentSectionProps) {
  const userRaw = localStorage.getItem("user");
  const token = localStorage.getItem("token") || undefined;
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isLoggedIn = !!(user && token);

  const isJindungo = contentType === 'jindungo';
  const hasEliteAccess = ['elite', 'admin', 'escritor', 'revisor'].includes(user?.role);
  const canMention = !isJindungo || hasEliteAccess;

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyingToAuthor, setReplyingToAuthor] = useState<string>("");
  const [expandedReplies, setExpandedReplies] = useState<Record<string, number>>({});
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | "top">("oldest");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ analysis: any[]; summary: string; totalAbusivos: number; totalSuspeitos: number } | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!contentId) { setLoading(false); return; }
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments/${encodeURIComponent(contentId)}`);
        const data = await res.json();
        if (Array.isArray(data)) setComments(data);
      } catch (err) { console.error("Erro ao carregar comentários:", err); }
      finally { setLoading(false); }
    };
    fetchComments();
    const interval = setInterval(fetchComments, 30000);
    return () => clearInterval(interval);
  }, [contentId]);

  // Pesquisar utilizadores para menções
  useEffect(() => {
    if (mentionSearch === null) return;
    const timeout = setTimeout(() => {
      fetch(`/api/users/search?q=${mentionSearch}`)
        .then(r => r.json())
        .then(data => setMentionResults(data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [mentionSearch]);

  // Update a comment in the tree (handles nested)
  const updateInTree = (list: Comment[], updated: Comment): Comment[] =>
    list.map(c => {
      if (c.id === updated.id) return { ...c, ...updated, replies: c.replies };
      if (c.replies?.length) return { ...c, replies: updateInTree(c.replies, updated) };
      return c;
    });

  // Remove a comment from the tree
  const removeFromTree = (list: Comment[], id: string): Comment[] =>
    list
      .filter(c => c.id !== id)
      .map(c => ({ ...c, replies: c.replies?.length ? removeFromTree(c.replies, id) : c.replies }));

  const handleUpdate = (updated: Comment) => setComments(prev => updateInTree(prev, updated));
  const handleDeleteLocal = (id: string) => setComments(prev => removeFromTree(prev, id));

  const submitComment = async () => {
    const text = newComment.trim();
    if (!text || !isLoggedIn || posting) return;
    const cid = contentId || "general";
    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ contentId: cid, text, parentId: replyingToId || null }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); console.error("Erro ao publicar:", err); return; }
      const newEntry: Comment = await res.json();
      if (replyingToId !== null) {
        const addReply = (list: Comment[]): Comment[] =>
          list.map(c => {
            if (c.id === replyingToId) return { ...c, replies: [...(c.replies || []), newEntry] };
            if (c.replies?.length) return { ...c, replies: addReply(c.replies) };
            return c;
          });
        setComments(prev => addReply(prev));
        setReplyingToId(null);
        setReplyingToAuthor("");
      } else {
        setComments(prev => [...prev, newEntry]);
      }
      setNewComment("");
    } catch (err) { console.error("Erro de rede:", err); }
    finally { setPosting(false); }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewComment(val);
    
    // Detetar se estamos a escrever uma menção (última palavra começa por @)
    const match = val.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);
    if (match) {
      if (!canMention) {
        setMentionSearch(null);
        setMentionResults([]);
        return;
      }
      setMentionSearch(match[1]);
    } else {
      setMentionSearch(null);
      setMentionResults([]);
    }
  };

  const insertMention = (mentionName: string) => {
    const match = newComment.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);
    if (match) {
      const start = newComment.lastIndexOf('@' + match[1]);
      const nextComment = newComment.substring(0, start) + '@' + mentionName + ' ';
      setNewComment(nextComment);
      setMentionSearch(null);
      setMentionResults([]);
      inputRef.current?.focus();
    }
  };

  const handleAddComment = (e: React.FormEvent) => { e.preventDefault(); submitComment(); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); }
  };

  const handleReply = (id: string, author: string) => {
    setReplyingToId(id);
    setReplyingToAuthor(author);
    setNewComment(`@${author.replace(/\s+/g, '')} `);
    inputRef.current?.focus({ preventScroll: true });
  };

  const handleExpand = (id: string, total: number, currentVisible: number) =>
    setExpandedReplies(prev => ({ ...prev, [id]: Math.min(currentVisible + 5, total) }));

  const handleCollapse = (id: string) =>
    setExpandedReplies(prev => { const next = { ...prev }; delete next[id]; return next; });

  const handleAnalyze = async () => {
    if (!contentId || !token || user?.role !== 'admin') return;
    setAnalyzing(true);
    setAiResult(null);
    setShowAiPanel(true);
    try {
      const res = await fetch(`/api/admin/comments/analyze/${encodeURIComponent(contentId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAiResult(data);
    } catch (err) { console.error(err); }
    finally { setAnalyzing(false); }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortOrder === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOrder === "top") {
      const likesA = a.likes?.length || 0;
      const likesB = b.likes?.length || 0;
      if (likesA !== likesB) return likesB - likesA;
      // Desempate pela data mais recente
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // "oldest" (default da API)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <section className={`pt-12 border-t border-[#3A0310]/10 dark:border-white/5 pb-28 ${className}`}>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h3 className="text-xl font-black text-neutral-800 dark:text-white flex items-center gap-3 uppercase tracking-tight">
          <MessageCircle className="w-6 h-6 text-[#3A0310] dark:text-[#E8B4B8]" />
          {title} ({comments.length})
        </h3>
        
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && comments.length > 0 && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
              {analyzing ? 'A analisar...' : 'Analisar IA'}
            </button>
          )}
          {comments.length > 0 && (
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-neutral-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent border-none text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300 focus:outline-none cursor-pointer"
              >
                <option value="oldest">Mais Antigos</option>
                <option value="recent">Mais Recentes</option>
                <option value="top">Mais Destacados</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Panel */}
      {showAiPanel && (
        <div className="mb-6 bg-violet-50 dark:bg-violet-500/5 border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">Análise IA de Comentários</span>
            </div>
            <button onClick={() => setShowAiPanel(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {analyzing && (
            <div className="flex items-center gap-2 py-4 justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
              <span className="text-xs font-bold text-violet-600">A analisar comentários com IA...</span>
            </div>
          )}
          
          {aiResult && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white dark:bg-white/5 rounded-xl p-2 text-center border border-neutral-200 dark:border-white/10">
                  <p className="text-lg font-black text-neutral-800 dark:text-white">{aiResult.analysis.length}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Total</p>
                </div>
                <div className="bg-red-50 dark:bg-red-500/5 rounded-xl p-2 text-center border border-red-200 dark:border-red-500/20">
                  <p className="text-lg font-black text-red-600">{aiResult.totalAbusivos || 0}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-red-500">Abusivos</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/5 rounded-xl p-2 text-center border border-amber-200 dark:border-amber-500/20">
                  <p className="text-lg font-black text-amber-600">{aiResult.totalSuspeitos || 0}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">Suspeitos</p>
                </div>
              </div>
              
              {aiResult.summary && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mb-3 bg-white dark:bg-white/5 rounded-xl p-3 border border-neutral-200 dark:border-white/10">
                  {aiResult.summary}
                </p>
              )}
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {aiResult.analysis.map((item: any, idx: number) => (
                  <div key={idx} className={`bg-white dark:bg-white/5 rounded-xl p-3 border ${
                    item.status === 'abusivo' || item.status === 'violacao' ? 'border-red-300 dark:border-red-500/30' :
                    item.status === 'suspeito' ? 'border-amber-300 dark:border-amber-500/30' :
                    'border-green-200 dark:border-green-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                        item.status === 'abusivo' || item.status === 'violacao' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        item.status === 'suspeito' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                        'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                      }`}>{item.status}</span>
                      {item.severidade !== 'nenhuma' && (
                        <span className="text-[8px] font-bold text-neutral-500">{item.severidade}</span>
                      )}
                      <span className="text-[8px] text-neutral-400 ml-auto">{item.comment?.author}</span>
                    </div>
                    <p className="text-[10px] text-neutral-700 dark:text-neutral-300 line-clamp-1">"{item.comment?.text}"</p>
                    <p className="text-[8px] text-neutral-400 mt-1">{item.motivo}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-3 mb-10">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-3 text-neutral-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest">A carregar discussões...</span>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500 italic text-center py-8">
            Ainda não há comentários. Sê o primeiro a comentar!
          </p>
        ) : null}
        <AnimatePresence>
          {sortedComments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              currentUserRole={user?.role}
              token={token}
              replyingToId={replyingToId}
              handleReply={handleReply}
              onUpdate={handleUpdate}
              onDelete={handleDeleteLocal}
              expandedReplies={expandedReplies}
              onExpand={handleExpand}
              onCollapse={handleCollapse}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-48px)] md:max-w-xl z-[60]">
        <AnimatePresence>
          {replyingToId !== null && (
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
              className="bg-[#3A0310] px-4 py-2 rounded-t-2xl flex items-center justify-between border-x border-t border-[#E8B4B8]/20">
              <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "#E8B4B8" }}>
                Respondendo a <span style={{ color: "white" }}>{replyingToAuthor}</span>
              </span>
              <button onClick={() => { setReplyingToId(null); setReplyingToAuthor(""); setNewComment(""); }}
                className="text-[10px] font-black text-white/60 hover:text-white">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dropdown de Menções */}
        <AnimatePresence>
          {mentionSearch !== null && mentionResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-6 mb-2 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-[70]"
            >
              <div className="bg-neutral-50 dark:bg-white/5 px-3 py-1.5 border-b border-neutral-200 dark:border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Pessoas correspondentes</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {mentionResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => insertMention(u.mentionName)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                  >
                    {u.avatar ? (
                      <img src={u.avatar} className="w-6 h-6 rounded-lg object-cover" alt="" />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-neutral-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold uppercase text-neutral-600 dark:text-neutral-400">
                        {u.name?.charAt(0) || u.mentionName.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800 dark:text-white">{u.name}</span>
                      <span className="text-[9px] text-neutral-500">@{u.mentionName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoggedIn ? (
          <form onSubmit={handleAddComment}
            className="bg-black/80 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/15 flex gap-2 shadow-2xl relative z-[60]">
            {user.avatar || user.photo || user.image ? (
              <img src={user.avatar || user.photo || user.image} alt="Avatar"
                className="w-9 h-9 rounded-xl flex-shrink-0 object-cover border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center text-[10px] font-black uppercase border border-white/10"
                style={{ color: "#E8B4B8" }}>
                {(user.name || user.email || "?").charAt(0)}
              </div>
            )}
            <input ref={inputRef} type="text" value={newComment}
              onChange={handleCommentChange} onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none rounded-full px-3 py-3 text-sm focus:outline-none force-white force-white-placeholder"
              style={{ color: "#ffffff" }} />
            <button type="button" onClick={submitComment} disabled={!newComment.trim() || posting}
              className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg,#3A0310,#5A051A)", border: "1px solid rgba(232,180,184,0.3)" }}>
              {posting
                ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "white" }} />
                : <Send className="w-4 h-4" style={{ color: "white", stroke: "white" }} />}
            </button>
          </form>
        ) : (
          <div className="bg-black/80 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/15 flex items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 flex-shrink-0" style={{ color: '#ffffff' }} />
              <span className="text-sm font-medium" style={{ color: '#ffffff' }}>Faz login para participar na discussão</span>
            </div>
            <Link to="/login"
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#3A0310,#5A051A)", color: "white" }}>
              Login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
