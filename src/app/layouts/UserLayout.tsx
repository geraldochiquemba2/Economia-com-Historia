import React from "react";
import { Outlet, NavLink, Link, useLocation, useNavigate, MemoryRouter } from "react-router";
import { Home, Compass, BookOpenCheck, MessageSquare, User, ShieldAlert, Sun, Moon, LogOut, PenLine, ClipboardCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/PageTransition";
import { ScrollToTop } from "../components/ScrollToTop";
import { AIChatAssistant } from "../components/AIChatAssistant";

export function UserLayout() {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    { to: "/app", icon: Home, label: "Início", exact: true },
    { to: "/app/explore", icon: Compass, label: "Explorar" },
    { to: "/app/quiz", icon: BookOpenCheck, label: "Quiz" },
    { to: "/app/forum", icon: MessageSquare, label: "Fórum" },
  ];
  if (token && (user?.role === 'escritor' || user?.role === 'revisor')) {
    navItems.push({ to: "/app/create", icon: PenLine, label: "Criar" });
  }
  if (token && user?.role === 'revisor') {
    navItems.push({ to: "/admin/review", icon: ClipboardCheck, label: "Revisão" });
  }
  if (token && user?.role !== 'admin') {
    navItems.push({ to: "/app/profile", icon: User, label: "Perfil" });
  }

  const [isLight, setIsLight] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "light";
      return true; // Default to Light Mode
    }
    return true;
  });

  React.useEffect(() => {
    if (isLight) {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [isLight]);

  const toggleTheme = () => {
    setIsLight(!isLight);
    localStorage.setItem("theme", !isLight ? "light" : "dark");
  };

  const getLinkClass = (isActive: boolean) => {
    if (isActive) {
      return isLight
        ? "flex items-center gap-1.5 lg:gap-2.5 px-2.5 py-2 lg:px-4 lg:py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest bg-[#3A0310]/5 text-[#3A0310] transition-all duration-300"
        : "flex items-center gap-1.5 lg:gap-2.5 px-2.5 py-2 lg:px-4 lg:py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest bg-[#E8B4B8]/10 text-white transition-all duration-300";
    } else {
      return isLight
        ? "flex items-center gap-1.5 lg:gap-2.5 px-2.5 py-2 lg:px-4 lg:py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest text-neutral-500 hover:text-[#3A0310] hover:bg-[#3A0310]/5 transition-all duration-300"
        : "flex items-center gap-1.5 lg:gap-2.5 px-2.5 py-2 lg:px-4 lg:py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-200 hover:bg-white/5 transition-all duration-300";
    }
  };

  return (
    <div className={`flex flex-col min-h-screen w-full font-sans md:max-w-none md:border-x-0 mx-auto max-w-md shadow-2xl relative border-x border-[#3A0310]/30 transition-all duration-300 ${
      isLight ? "bg-[#FDFBFB] text-neutral-800" : "bg-[#0F0F0F] text-neutral-100"
    }`}>
      <ScrollToTop />

      {/* Top Sticky Navigation for PC */}
      <header className={`backdrop-blur-xl sticky top-0 z-[100] md:block hidden w-full shadow-md transition-all duration-300 sticky-nav ${
        isLight 
          ? "bg-white/95 border-b border-neutral-200/80" 
          : "bg-[#0F0F0F]/90 border-b border-white/5"
      }`}>
        <div className="max-w-5xl mx-auto px-6 h-24 flex items-center justify-between">
          <NavLink to="/app" className="flex items-center gap-3 flex-shrink-0">
            <span className={`font-black text-xl tracking-tight uppercase drop-shadow-sm transition-colors ${
              isLight ? "text-[#3A0310]" : "text-white"
            }`}>
              <span className="md:inline hidden">Economia com História</span>
              <span className="md:hidden inline">Economia</span>
            </span>
          </NavLink>
          
          <nav className="flex items-center gap-1 lg:gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => getLinkClass(isActive)}
                title={item.label}
              >
              <item.icon className="w-4.5 h-4.5 stroke-[2px] flex-shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}

          {/* Painel Administrativo */}
          {user && user.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => getLinkClass(isActive)}
              title="Painel Admin"
            >
              <ShieldAlert className="w-4.5 h-4.5 stroke-[2px] flex-shrink-0" />
              <span className="hidden lg:inline">Painel Admin</span>
            </NavLink>
          )}

          {/* Login and Register Buttons for Unauthenticated Users */}
          {!token && (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-[#3A0310] dark:text-[#E8B4B8] hover:bg-[#3A0310]/10 dark:hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-[#3A0310] dark:border-[#E8B4B8]">
                Login
              </Link>
              <Link to="/register" className="text-[10px] font-black uppercase tracking-widest text-white bg-[#3A0310] hover:bg-[#5A051A] dark:bg-[#E8B4B8] dark:text-[#3A0310] dark:hover:bg-white px-4 py-2 rounded-xl transition-all shadow-md border border-[#3A0310] dark:border-[#E8B4B8]">
                Cadastrar
              </Link>
            </div>
          )}

          {/* Logout Button for Authenticated Users */}
          {token && (
            <div className="flex items-center ml-1 border-l border-[#3A0310]/20 dark:border-white/10 pl-2 lg:pl-3">
              <button 
                onClick={handleLogout}
                title="Terminar Sessão"
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600/10 dark:hover:bg-red-400/10 px-2 lg:px-3 py-2 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden xl:inline">Sair</span>
              </button>
            </div>
          )}

            {/* Modo Claro/Escuro Toggle Switch */}
            <div className={`flex items-center gap-2 ml-2 lg:ml-4 border-l pl-3 lg:pl-5 transition-colors duration-300 flex-shrink-0 ${
              isLight ? 'border-[#3A0310]/20' : 'border-white/10'
            }`}>
              {isLight
                ? <Sun className="w-4 h-4 flex-shrink-0 text-[#3A0310]" />
                : <Moon className="w-4 h-4 flex-shrink-0 text-neutral-400" />
              }
              <button
                onClick={toggleTheme}
                aria-label="Alternar tema"
                title={isLight ? "Mudar para modo escuro" : "Mudar para modo claro"}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 focus:outline-none cursor-pointer relative shadow-inner flex-shrink-0 ${
                  isLight ? "bg-[#3A0310]" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
                    isLight ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-24 relative w-full md:max-w-5xl md:mx-auto md:px-6 md:pt-10">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} className="min-h-full">
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <AIChatAssistant />

      {/* Bottom Navigation for Mobile */}
      <nav className={`backdrop-blur-xl border-t fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md pb-safe-area flex md:hidden justify-around items-center h-14 md:h-12 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] z-[60] transition-all duration-300 ${
        isLight ? "bg-white/95 border-neutral-200/80" : "bg-[#0F0F0F]/95 border-white/5"
      }`}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full relative transition-all duration-300 ${
                isActive 
                  ? (isLight ? "text-[#3A0310]" : "text-white") 
                  : (isLight ? "text-neutral-400 hover:text-[#3A0310]" : "text-white/60 hover:text-white")
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={isActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative"
                >
                  <item.icon className={`w-4 h-4 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
                  {isActive && (
                    <motion.div 
                       layoutId="nav-glow"
                      className="absolute -inset-2 bg-neutral-200 dark:bg-[#3A0310] rounded-full blur-md opacity-50 dark:opacity-30 -z-10"
                    />
                  )}
                </motion.div>
                <span className="text-[7px] uppercase tracking-widest font-black transition-all duration-300">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute bottom-2 w-1.5 h-1.5 bg-[#E8B4B8] rounded-full shadow-none"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Admin Panel Nav Item — shown only for admins */}
        {user && user.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full relative transition-all duration-300 ${
                isActive 
                  ? (isLight ? "text-[#3A0310]" : "text-[#E8B4B8]") 
                  : (isLight ? "text-neutral-400 hover:text-[#3A0310]" : "text-white/60 hover:text-white")
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={isActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative"
                >
                  <ShieldAlert className={`w-6 h-6 mb-1 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow-admin"
                      className="absolute -inset-2 bg-[#3A0310]/20 dark:bg-[#3A0310] rounded-full blur-md opacity-50 dark:opacity-30 -z-10"
                    />
                  )}
                </motion.div>
                <span className="text-[10px] uppercase tracking-widest font-black transition-all duration-300 mt-1">
                  Admin
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot-admin"
                    className="absolute bottom-2 w-1.5 h-1.5 bg-[#3A0310] dark:bg-[#E8B4B8] rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        )}

        {/* Login Nav Item for Unauthenticated Users */}
        {!token && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full relative transition-all duration-300 ${
                isActive 
                  ? (isLight ? "text-[#3A0310]" : "text-[#E8B4B8]") 
                  : (isLight ? "text-neutral-400 hover:text-[#3A0310]" : "text-white/60 hover:text-white")
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={isActive ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative"
                >
                  <User className={`w-6 h-6 mb-1 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
                  {isActive && (
                    <motion.div 
                       layoutId="nav-glow-login"
                      className="absolute -inset-2 bg-neutral-200 dark:bg-[#3A0310] rounded-full blur-md opacity-50 dark:opacity-30 -z-10"
                    />
                  )}
                </motion.div>
                <span className="text-[10px] uppercase tracking-widest font-black transition-all duration-300 mt-1">
                  Login
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot-login"
                    className="absolute bottom-2 w-1.5 h-1.5 bg-[#3A0310] dark:bg-[#E8B4B8] rounded-full shadow-none"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        )}

        {/* Theme Toggle inside bottom nav */}
        <button
          onClick={toggleTheme}
          className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
            isLight ? "text-neutral-400 hover:text-[#3A0310]" : "text-white/60 hover:text-white"
          }`}
          aria-label="Alternar tema"
        >
          <motion.div
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isLight ? <Moon className="w-6 h-6 mb-1 stroke-[1.5px]" /> : <Sun className="w-6 h-6 mb-1 stroke-[1.5px]" />}
          </motion.div>
          <span className="text-[10px] uppercase tracking-widest font-black mt-1">
            {isLight ? "Escuro" : "Claro"}
          </span>
        </button>
      </nav>
      



    </div>
  );
}

export default function UserLayoutPreview() {
  return (
    <MemoryRouter>
      <UserLayout />
    </MemoryRouter>
  );
}
