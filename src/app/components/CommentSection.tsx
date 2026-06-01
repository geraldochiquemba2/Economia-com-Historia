import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, CornerDownRight, Send, Lock } from "lucide-react";
import { Link } from "react-router";

// ─── Types ───────────────────────────────────────────────────────────────────
export type Comment = {
  id: number;
  author: string;
  avatar: string;
  time: string;
  text: string;
  replies: Comment[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function addReplyToTree(comments: Comment[], parentId: number, newReply: Comment): Comment[] {
  return comments.map((c) => {
    if (c.id === parentId) {
      return { ...c, replies: [...(c.replies || []), newReply] };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: addReplyToTree(c.replies, parentId, newReply) };
    }
    return c;
  });
}

// ─── CommentNode ─────────────────────────────────────────────────────────────
type CommentNodeProps = {
  comment: Comment;
  depth?: number;
  parentId?: number;
  handleReply: (id: number, author: string) => void;
  expandedReplies: Record<number, number>;
  onExpand: (id: number, total: number, currentVisible: number) => void;
  onCollapse: (id: number) => void;
};

const CommentNode = ({
  comment,
  depth = 0,
  parentId,
  handleReply,
  expandedReplies,
  onExpand,
  onCollapse,
}: CommentNodeProps) => {
  const isTopLevel = depth === 0;
  const defaultVisible = depth === 0 ? 2 : 1;
  const visibleCount = expandedReplies[comment.id] || defaultVisible;
  const totalReplies = comment.replies?.length || 0;
  const remaining = totalReplies - visibleCount;

  // At max depth (3), replies go to the parent node instead of going deeper
  const threadId = depth >= 2 ? (parentId ?? comment.id) : comment.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={
        isTopLevel
          ? "bg-white dark:bg-white/5 p-4 md:p-5 rounded-[2rem] border border-[#3A0310] dark:border-[#E8B4B8]/30 hover:border-[#5A051A] dark:hover:border-[#E8B4B8]/60 transition-all relative overflow-hidden shadow-sm"
          : "relative group/reply"
      }
    >
      {!isTopLevel && (
        <div className="absolute -left-6 top-3 w-4 h-0.5 bg-[#3A0310] dark:bg-[#E8B4B8] rounded-r-full" />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`${
              isTopLevel
                ? "w-8 h-8 rounded-xl text-[10px]"
                : "w-6 h-6 rounded-lg text-[8px] z-10 relative shadow-sm"
            } bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center font-black border border-white/10 uppercase`}
            style={{ color: "#E8B4B8" }}
          >
            {comment.author.charAt(0)}
          </div>
          <div>
            <span
              className={`font-bold text-neutral-800 dark:text-white block leading-none ${
                isTopLevel ? "text-xs mb-1" : "text-[10px] mb-0.5"
              }`}
            >
              {comment.author}
            </span>
            <span
              className={`text-neutral-500 dark:text-neutral-300 font-black uppercase tracking-widest ${
                isTopLevel ? "text-[9px]" : "text-[7px]"
              }`}
            >
              {comment.avatar}
            </span>
          </div>
        </div>
        <span
          className={`font-black text-neutral-400 dark:text-neutral-300 uppercase tracking-widest ${
            isTopLevel ? "text-[9px]" : "text-[7px]"
          }`}
        >
          {comment.time}
        </span>
      </div>

      {/* Text */}
      <p
        className={`text-neutral-700 dark:text-neutral-200 font-medium leading-relaxed italic ${
          isTopLevel ? "text-sm" : "text-xs"
        }`}
      >
        "{comment.text}"
      </p>

      {/* Reply Button */}
      <div
        className={`mt-2 flex justify-end ${
          isTopLevel ? "pt-3 border-t border-[#3A0310]/10 dark:border-white/10" : ""
        }`}
      >
        <button
          onClick={() => handleReply(threadId, comment.author)}
          className={`flex items-center gap-1 font-black uppercase tracking-widest text-[#3A0310] dark:text-[#E8B4B8] transition-opacity ${
            isTopLevel
              ? "opacity-70 hover:opacity-100 gap-1.5 text-[10px]"
              : "text-[9px] opacity-70 hover:opacity-100"
          }`}
        >
          <CornerDownRight className={isTopLevel ? "w-3.5 h-3.5" : "w-3 h-3"} />
          Responder
        </button>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && depth < 2 && (
        <div className="mt-3 pt-3 relative">
          <div className="absolute left-[15px] top-0 bottom-4 w-0.5 bg-[#3A0310] dark:bg-[#E8B4B8] rounded-full" />
          <div className="space-y-2 pl-10 md:pl-12">
            {comment.replies.slice(0, visibleCount).map((reply) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                parentId={threadId}
                handleReply={handleReply}
                expandedReplies={expandedReplies}
                onExpand={onExpand}
                onCollapse={onCollapse}
              />
            ))}

            {totalReplies > defaultVisible && (
              <div className="pt-2 flex flex-col items-start gap-2 relative z-10">
                {remaining > 0 && (
                  <button
                    onClick={() => onExpand(comment.id, totalReplies, visibleCount)}
                    className="text-[9px] font-black text-[#3A0310] dark:text-[#E8B4B8] uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3 h-3" /> Ver mais{" "}
                    {Math.min(remaining, 5)}{" "}
                    {Math.min(remaining, 5) === 1 ? "resposta" : "respostas"}
                  </button>
                )}
                {remaining <= 0 && (
                  <button
                    onClick={() => onCollapse(comment.id)}
                    className="text-[9px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest hover:underline"
                  >
                    Minimizar respostas
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── CommentSection ───────────────────────────────────────────────────────────
type CommentSectionProps = {
  title?: string;
  placeholder?: string;
  className?: string;
};

export function CommentSection({ title = "Discussão", placeholder = "Contribuir para o debate...", className = "" }: CommentSectionProps) {
  // Auth
  const userRaw = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isLoggedIn = !!(user && token);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyingToAuthor, setReplyingToAuthor] = useState<string>("");
  const [expandedReplies, setExpandedReplies] = useState<Record<number, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;

    const newEntry: Comment = {
      id: Date.now(),
      author: user.name || user.email || "Eu",
      avatar: user.role || "Académico",
      time: "Agora mesmo",
      text: newComment,
      replies: [],
    };

    if (replyingToId !== null) {
      setComments((prev) => addReplyToTree(prev, replyingToId, newEntry));
      setReplyingToId(null);
      setReplyingToAuthor("");
    } else {
      setComments((prev) => [...prev, newEntry]);
    }
    setNewComment("");
  };

  const handleReply = (id: number, author: string) => {
    setReplyingToId(id);
    setReplyingToAuthor(author);
    setNewComment(`@${author} `);
    inputRef.current?.focus({ preventScroll: true });
  };

  const handleExpand = (id: number, total: number, currentVisible: number) => {
    setExpandedReplies((prev) => ({ ...prev, [id]: Math.min(currentVisible + 5, total) }));
  };

  const handleCollapse = (id: number) => {
    setExpandedReplies((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <section className={`pt-12 border-t border-[#3A0310]/10 dark:border-white/5 pb-28 ${className}`}>
      {/* Title */}
      <h3 className="text-xl font-black text-neutral-800 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
        <MessageCircle className="w-6 h-6 text-[#3A0310] dark:text-[#E8B4B8]" />
        {title} ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-4 mb-10">
        {comments.length === 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500 italic text-center py-8">
            Ainda não há comentários. Sê o primeiro a comentar!
          </p>
        )}
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              handleReply={handleReply}
              expandedReplies={expandedReplies}
              onExpand={handleExpand}
              onCollapse={handleCollapse}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[calc(100%-48px)] md:max-w-xl z-[60]">
        {/* Replying-to indicator */}
        <AnimatePresence>
          {replyingToId !== null && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="bg-[#3A0310] px-4 py-2 rounded-t-2xl flex items-center justify-between border-x border-t border-[#E8B4B8]/20"
            >
              <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: "#E8B4B8" }}>
                Respondendo a <span style={{ color: "white" }}>{replyingToAuthor}</span>
              </span>
              <button
                onClick={() => { setReplyingToId(null); setReplyingToAuthor(""); setNewComment(""); }}
                className="text-[10px] font-black text-white/60 hover:text-white"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoggedIn ? (
          <form
            onSubmit={handleAddComment}
            className="bg-black/80 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/15 flex gap-2 shadow-2xl"
          >
            <div
              className="w-9 h-9 rounded-xl flex-shrink-0 bg-gradient-to-br from-[#3A0310] to-[#5A051A] flex items-center justify-center text-[10px] font-black uppercase border border-white/10"
              style={{ color: "#E8B4B8" }}
            >
              {(user.name || user.email || "?").charAt(0)}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none rounded-full px-3 py-3 text-sm focus:outline-none force-white force-white-placeholder"
              style={{ color: "#ffffff" }}
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg,#3A0310,#5A051A)", border: "1px solid rgba(232,180,184,0.3)" }}
            >
              <Send className="w-4 h-4" style={{ color: "white", stroke: "white" }} />
            </button>
          </form>
        ) : (
          <div className="bg-black/80 backdrop-blur-2xl p-4 rounded-[2rem] border border-white/15 flex items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-[#E8B4B8] flex-shrink-0" />
              <span className="text-sm text-neutral-300 font-medium">
                Faz login para participar na discussão
              </span>
            </div>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#3A0310,#5A051A)", color: "white" }}
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
