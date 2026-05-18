import React from "react";
import { Outlet, NavLink, useLocation, useNavigate, MemoryRouter } from "react-router";
import { Home, Compass, BookOpenCheck, MessageSquare, User, ShieldAlert, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/PageTransition";
import { ScrollToTop } from "../components/ScrollToTop";

export function UserLayout() {
  const location = useLocation();

  const navItems = [
    { to: "/app", icon: Home, label: "Início", exact: true },
    { to: "/app/explore", icon: Compass, label: "Explorar" },
    { to: "/app/quiz", icon: BookOpenCheck, label: "Quiz" },
    { to: "/app/forum", icon: MessageSquare, label: "Fórum" },
    { to: "/app/profile", icon: User, label: "Perfil" },
  ];

  // Theme support: Light Mode / Dark Mode
  const [isLight, setIsLight] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "light";
      return document.documentElement.classList.contains("light");
    }
    return false;
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

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0F0F0F] text-neutral-100 font-sans md:max-w-none md:border-x-0 mx-auto max-w-md shadow-2xl relative border-x border-[#3A0310]/30 transition-all duration-300">
      <ScrollToTop />

      {/* Top Sticky Navigation for PC */}
      <header className="bg-[#0F0F0F]/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100] md:block hidden w-full shadow-md transition-all duration-300 sticky-nav">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <NavLink to="/app" className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tight text-white uppercase drop-shadow-sm">
              Economia com História
            </span>
          </NavLink>
          
          <nav className="flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                    isActive ? "text-[#E8B4B8] scale-105" : "text-neutral-400 hover:text-neutral-200"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Painel Administrativo */}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive ? "text-[#E8B4B8] scale-105" : "text-neutral-400 hover:text-neutral-200"
                }`
              }
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Painel Admin</span>
            </NavLink>

            {/* Modo Claro Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-200 transition-colors bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 cursor-pointer"
            >
              {isLight ? (
                <>
                  <Moon className="w-4 h-4 text-neutral-400" />
                  <span>Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Claro</span>
                </>
              )}
            </button>
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

      {/* Bottom Navigation for Mobile */}
      <nav className="bg-[#0F0F0F]/90 backdrop-blur-xl border-t border-white/5 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md pb-safe-area flex md:hidden justify-around items-center h-20 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.5)] z-[60]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full relative transition-all duration-300 ${
                isActive ? "text-[#E8B4B8]" : "text-neutral-500 hover:text-neutral-300"
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
                  <item.icon className={`w-6 h-6 mb-1 ${isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} />
                  {isActive && (
                    <motion.div 
                       layoutId="nav-glow"
                      className="absolute -inset-2 bg-[#3A0310] rounded-full blur-md opacity-30 -z-10"
                    />
                  )}
                </motion.div>
                <span className={`text-[10px] uppercase tracking-widest font-black transition-all duration-300 ${isActive ? "opacity-100" : "opacity-0 translate-y-2"}`}>
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute bottom-2 w-1.5 h-1.5 bg-[#E8B4B8] rounded-full shadow-[0_0_8px_#E8B4B8]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Admin Quick Access (Floating) - HIDDEN ON PC */}
      <NavLink 
        to="/admin" 
        className="fixed bottom-24 right-6 w-12 h-12 bg-[#3A0310] rounded-full flex md:hidden items-center justify-center shadow-2xl border border-[#E8B4B8]/20 z-50 text-white active:scale-95 transition-transform"
      >
        <ShieldAlert className="w-5 h-5" />
      </NavLink>
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
