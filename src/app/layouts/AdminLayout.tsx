import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate, MemoryRouter } from "react-router";
import { LayoutDashboard, FileVideo, Users, LogOut, ShieldAlert, Trophy, Lightbulb, ClipboardCheck, Bell, Folder, KeyRound, Shield, Menu, X } from "lucide-react";
import { NotificationsModal } from "../components/NotificationsModal";
import { MiniPlayer } from "../components/MiniPlayer";
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  // Verificar se o token é válido ao carregar o admin
  React.useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch('/api/admin/password-resets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } catch {}
    };
    verifyToken();
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

  React.useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

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
      <header className="bg-white/80 dark:bg-[#0F0F0F]/80 backdrop-blur-md border-b border-[#3A0310]/20 px-4 md:px-6 py-3 md:py-4 shadow-md z-20 sticky top-0 w-full">
        <div className="flex flex-wrap items-center gap-3">
          {/* Hamburger - Mobile only */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-xl bg-[#3A0310]/10 dark:bg-white/5 border border-[#3A0310]/20 dark:border-white/10 active:scale-95 transition-all shrink-0"
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
            ) : (
              <Menu className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
            )}
          </button>

          <div className="flex items-center gap-2 text-[#E8B4B8] cursor-pointer shrink-0" onClick={() => navigate("/admin")}>
            <ShieldAlert className="w-5 h-5 text-[#3A0310] dark:text-[#E8B4B8]" />
            <span className="font-bold text-lg tracking-tight text-[#3A0310] dark:text-white uppercase">Admin</span>
          </div>
          
          {/* Nav horizontal - Desktop only, wraps if needed */}
          <nav className="hidden md:flex flex-wrap items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap px-2.5 py-1.5 rounded-lg ${
                    isActive ? "text-rose-500 bg-rose-500/10" : "text-neutral-500 dark:text-gray-400 hover:text-[#3A0310] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
                  }`
                }
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.to === "/admin/review" && pendingCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[8px] font-black rounded-full px-1 animate-pulse">{pendingCount}</span>
                )}
                {item.to === "/admin/password-resets" && passwordResetCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[8px] font-black rounded-full px-1 animate-bounce">{passwordResetCount}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <button onClick={() => setShowNotifications(true)} className="relative p-2 bg-[#3A0310]/10 dark:bg-white/5 rounded-xl hover:bg-[#3A0310]/20 dark:hover:bg-white/10 transition-all border border-[#3A0310]/20 dark:border-white/10 active:scale-95">
              <Bell className={`w-4 h-4 text-[#3A0310] dark:text-[#E8B4B8] ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[7px] font-black rounded-full border-2 border-white dark:border-[#0F0F0F] px-0.5 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate("/app")} className="text-[#3A0310] dark:text-white hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#3A0310]/10 dark:bg-white/5 px-3 py-2 rounded-xl border border-[#3A0310]/20 dark:border-white/10 cursor-pointer hover:bg-[#3A0310] dark:hover:bg-white/10 shadow-sm hover:shadow-md active:scale-95">
              <LogOut className="w-4 h-4" /> <span className="hidden lg:inline">Voltar ao App</span>
            </button>
            <button onClick={handleLogout} title="Terminar Sessão" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white force-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-95 border border-red-700/50">
              <LogOut className="w-4 h-4" /> <span className="hidden lg:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/50 z-30"
              onClick={() => setShowMobileMenu(false)}
            />
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden fixed top-[57px] left-2 right-2 bg-white dark:bg-[#0F0F0F] rounded-2xl border border-[#3A0310]/20 dark:border-white/10 shadow-2xl z-40 max-h-[75vh] overflow-y-auto"
            >
              <nav className="py-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 mx-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        isActive
                          ? "text-rose-500 bg-rose-500/10"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-[#3A0310] dark:hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.to === "/admin/review" && pendingCount > 0 && (
                      <span className="ml-auto min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full px-1 animate-pulse">{pendingCount}</span>
                    )}
                    {item.to === "/admin/password-resets" && passwordResetCount > 0 && (
                      <span className="ml-auto min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full px-1 animate-bounce">{passwordResetCount}</span>
                    )}
                  </NavLink>
                ))}
                <div className="border-t border-neutral-200 dark:border-white/10 mx-4 my-2" />
                <button onClick={() => { setShowMobileMenu(false); navigate("/app"); }} className="flex items-center gap-3 w-full mx-2 px-4 py-3 rounded-xl text-sm font-bold text-[#3A0310] dark:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-all">
                  <LogOut className="w-5 h-5" /> Voltar ao App
                </button>
                <button onClick={() => { setShowMobileMenu(false); handleLogout(); }} className="flex items-center gap-3 w-full mx-2 px-4 py-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                  <LogOut className="w-5 h-5" /> Sair
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative w-full md:max-w-5xl md:mx-auto md:px-6 md:pt-10">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} className="h-full">
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <NotificationsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} onUnreadCountChange={setUnreadCount} />
      <MiniPlayer />
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
