import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate, MemoryRouter } from "react-router";
import { LayoutDashboard, FileVideo, Users, LogOut, ShieldAlert, MessageSquare, Trophy, Lightbulb, ClipboardCheck, Bell, Folder, KeyRound, Shield } from "lucide-react";
import { NotificationsModal } from "../components/NotificationsModal";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/PageTransition";
import { ScrollToTop } from "../components/ScrollToTop";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [passwordResetCount, setPasswordResetCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Buscar conteúdos pendentes
  const fetchPendingCount = async () => {
    try {
      const res = await fetch("/api/content/pending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingCount(Array.isArray(data) ? data.length : 0);
      }
    } catch { /* ignorar */ }
  };

  React.useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Buscar pedidos de redefinição de senha pendentes
  React.useEffect(() => {
    const fetchResets = async () => {
      try {
        const res = await fetch("/api/admin/password-resets", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPasswordResetCount(data.filter((r: any) => r.status === 'pending').length);
        }
      } catch {}
    };
    fetchResets();
    const interval = setInterval(fetchResets, 30000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/users/${user.id}/notifications`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setUnreadCount(data.filter(n => !n.isRead).length);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Aplicar o tema guardado quando o admin é montado
  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : false;
    if (isDark) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Painel", exact: true },
    { to: "/admin/content", icon: FileVideo, label: "Conteúdo" },
    { to: "/admin/review", icon: ClipboardCheck, label: "Revisão" },
    { to: "/admin/users", icon: Users, label: "Usuários" },
    { to: "/admin/quiz", icon: Trophy, label: "Quiz" },
    { to: "/admin/trivia", icon: Lightbulb, label: "Curiosidades" },
    { to: "/admin/categories", icon: Folder, label: "Categorias" },
    { to: "/admin/password-resets", icon: KeyRound, label: "Senhas" },
    { to: "/admin/ai-comments", icon: Shield, label: "Moderação IA" },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#FDFBFB] dark:bg-[#0F0F0F] text-neutral-900 dark:text-neutral-100 font-sans md:max-w-none md:border-x-0 md:border-t-0 mx-auto max-w-md shadow-2xl relative border-x-2 md:border-x-4 border-t-2 md:border-t-4 border-[#3A0310] transition-all duration-300">
      <ScrollToTop />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-md border-b border-[#3A0310]/20 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-md z-10 sticky top-0 w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#E8B4B8] cursor-pointer" onClick={() => navigate("/admin")}>
            <ShieldAlert className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
            <span className="font-bold text-lg tracking-tight text-[#3A0310] dark:text-white uppercase">Admin</span>
          </div>
          
          {/* Horizontal Nav Links for PC */}
          <nav className="md:flex hidden items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors relative ${
                    isActive ? "text-rose-500" : "text-neutral-500 dark:text-gray-400 hover:text-[#3A0310] dark:hover:text-white"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.to === "/admin/review" && pendingCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[8px] font-black rounded-full px-1 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                    {pendingCount}
                  </span>
                )}
                {item.to === "/admin/password-resets" && passwordResetCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[8px] font-black rounded-full px-1 animate-bounce shadow-[0_0_12px_rgba(239,68,68,0.7)]">
                    {passwordResetCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifications(true)} className="relative p-2.5 bg-[#3A0310]/10 dark:bg-white/5 rounded-xl hover:bg-[#3A0310]/20 dark:hover:bg-white/10 transition-all border border-[#3A0310]/20 dark:border-white/10 active:scale-95">
            <Bell className={`w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8] ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[7px] font-black rounded-full border-2 border-white dark:border-[#0F0F0F] px-0.5 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => navigate("/app")} 
            className="text-[#3A0310] dark:text-white hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#3A0310]/10 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-[#3A0310]/20 dark:border-white/10 cursor-pointer hover:bg-[#3A0310] dark:hover:bg-white/10 shadow-sm hover:shadow-md active:scale-95"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Voltar ao App</span>
          </button>
          <button 
            onClick={handleLogout}
            title="Terminar Sessão"
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white force-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95 border border-red-700/50"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 relative w-full md:max-w-5xl md:mx-auto md:px-6 md:pt-10">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} className="h-full">
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="bg-white dark:bg-gray-950 border-t border-[#3A0310]/20 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md pb-safe-area flex md:hidden justify-around items-center h-14 md:h-16 shadow-[0_-4px_15px_-1px_rgba(0,0,0,0.8)] z-20 border-x-2 md:border-x-4 border-[#3A0310] border-b-2 md:border-b-4 border-b-[#3A0310]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full relative transition-colors ${
                isActive ? "text-rose-500" : "text-gray-500 hover:text-gray-300"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="admin-bottom-nav-indicator"
                    className="absolute -top-1 w-1/2 h-1 bg-rose-500 rounded-b-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {item.to === "/admin/review" && pendingCount > 0 && (
                  <span className="absolute top-1 right-1/4 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[7px] font-black rounded-full px-0.5 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)] z-10">
                    {pendingCount}
                  </span>
                )}
                {item.to === "/admin/password-resets" && passwordResetCount > 0 && (
                  <span className="absolute top-1 right-1/4 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[7px] font-black rounded-full px-0.5 animate-bounce shadow-[0_0_12px_rgba(239,68,68,0.7)] z-10">
                    {passwordResetCount}
                  </span>
                )}
                <motion.div
                  animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                </motion.div>
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} onUnreadCountChange={setUnreadCount} />
    </div>
  );
}

export default function AdminLayoutPreview() {
  return (
    <MemoryRouter>
      <AdminLayout />
    </MemoryRouter>
  );
}
