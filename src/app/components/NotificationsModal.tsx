import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Heart, ThumbsDown, MessageCircle, X, CheckCheck, ArrowUp, ArrowDown, Shield } from "lucide-react";
import { useNavigate } from "react-router";

export function NotificationsModal({ isOpen, onClose, onUnreadCountChange }: { isOpen: boolean, onClose: () => void, onUnreadCountChange?: (count: number) => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const navigate = useNavigate();

  const fetchNotifications = () => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/notifications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
          onUnreadCountChange?.(data.filter(n => !n.isRead).length);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
        onUnreadCountChange?.(updated.filter(n => !n.isRead).length);
        return updated;
      });
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await fetch(`/api/users/${user.id}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, isRead: true }));
        onUnreadCountChange?.(0);
        return updated;
      });
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) markAsRead(notif.id);
    onClose();
    if (notif.contentId) {
      // Redireciona para o conteúdo e faz scroll para o comentário
      navigate(`/app/explore/${notif.contentId}`);
      // Um pequeno delay para dar tempo à página de carregar os comentários
      setTimeout(() => {
        const el = document.getElementById(`comment-${notif.commentId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-24 right-4 md:right-10 w-[90vw] md:w-96 max-h-[70vh] bg-white dark:bg-[#1A1A1A] rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-white/10 z-[201] flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-neutral-100 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3A0310]/10 dark:bg-white/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-neutral-800 dark:text-white">Notificações</h3>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{unreadCount} não lidas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="p-2 bg-neutral-200 dark:bg-white/10 rounded-xl hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors" title="Marcar todas como lidas">
                    <CheckCheck className="w-4 h-4 text-neutral-700 dark:text-white" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 bg-neutral-200 dark:bg-white/10 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4 text-neutral-700 dark:text-white hover:text-red-500" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 dark:text-neutral-400 font-medium text-sm">
                  Nenhuma notificação por enquanto.
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                      notif.isRead 
                        ? 'hover:bg-neutral-50 dark:hover:bg-white/5' 
                        : 'bg-[#3A0310]/5 dark:bg-[#E8B4B8]/10 hover:bg-[#3A0310]/10 dark:hover:bg-[#E8B4B8]/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-md bg-white dark:bg-neutral-800">
                      {notif.type === 'like' && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                      {notif.type === 'dislike' && <ThumbsDown className="w-4 h-4 text-neutral-500 fill-neutral-500" />}
                      {notif.type === 'mention' && <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />}
                      {notif.type === 'role_promotion' && <ArrowUp className="w-4 h-4 text-green-500 fill-green-500" />}
                      {notif.type === 'role_demotion' && <ArrowDown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs md:text-sm ${notif.isRead ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-900 dark:text-white font-bold'}`}>
                        {notif.type === 'like' && <><span className="font-black text-[#3A0310] dark:text-[#E8B4B8]">{notif.actorName}</span> meteu gosto no teu comentário.</>}
                        {notif.type === 'dislike' && <><span className="font-black text-neutral-500">Alguém</span> não gostou do teu comentário.</>}
                        {notif.type === 'mention' && <><span className="font-black text-[#3A0310] dark:text-[#E8B4B8]">{notif.actorName}</span> mencionou-te num comentário.</>}
                        {notif.type === 'role_promotion' && <><span className="font-black text-green-600 dark:text-green-400">Foste promovido(a)</span> para <span className="font-black text-[#3A0310] dark:text-[#E8B4B8]">{notif.contentId}</span>.</>}
                        {notif.type === 'role_demotion' && <><span className="font-black text-amber-600 dark:text-amber-400">Foste despromovido(a)</span> para <span className="font-black text-[#3A0310] dark:text-[#E8B4B8]">{notif.contentId}</span>.</>}
                      </p>
                      <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mt-1 block">
                        {new Date(notif.createdAt).toLocaleDateString('pt-PT')} às {new Date(notif.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
