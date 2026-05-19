import React from "react";
import { Outlet, NavLink, useLocation, useNavigate, MemoryRouter } from "react-router";
import { LayoutDashboard, FileVideo, Users, LogOut, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PageTransition } from "../components/PageTransition";
import { ScrollToTop } from "../components/ScrollToTop";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Painel", exact: true },
    { to: "/admin/content", icon: FileVideo, label: "Conteúdo" },
    { to: "/admin/users", icon: Users, label: "Usuários" },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0F0F0F] text-neutral-100 font-sans md:max-w-none md:border-x-0 md:border-t-0 mx-auto max-w-md shadow-2xl relative border-x-4 border-t-4 border-[#3A0310] transition-all duration-300">
      <ScrollToTop />
      
      {/* Header */}
      <header className="bg-[#0F0F0F]/80 backdrop-blur-md border-b border-[#3A0310]/20 px-6 py-4 flex items-center justify-between shadow-md z-10 sticky top-0 w-full">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#E8B4B8] cursor-pointer" onClick={() => navigate("/admin")}>
            <ShieldAlert className="w-5 h-5" />
            <span className="font-bold text-lg tracking-tight text-white uppercase">Admin</span>
          </div>
          
          {/* Horizontal Nav Links for PC */}
          <nav className="md:flex hidden items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive ? "text-rose-500" : "text-gray-400 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <button 
          onClick={() => navigate("/app")} 
          className="text-[#3A0310] dark:text-white hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-[#3A0310]/10 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-[#3A0310]/20 dark:border-white/10 cursor-pointer hover:bg-[#3A0310] dark:hover:bg-white/10 shadow-sm hover:shadow-md active:scale-95"
        >
          <LogOut className="w-4 h-4" /> Voltar ao App
        </button>
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
      <nav className="bg-gray-950 border-t border-[#3A0310]/20 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md pb-safe-area flex md:hidden justify-around items-center h-16 shadow-[0_-4px_15px_-1px_rgba(0,0,0,0.8)] z-20 border-x-4 border-[#3A0310] border-b-4 border-b-[#3A0310]">
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
