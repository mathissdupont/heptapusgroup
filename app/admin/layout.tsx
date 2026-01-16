// app/admin/layout.tsx
"use client";
import "../globals.css";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  HomeIcon,
  FolderIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  UsersIcon,
  Cog6ToothIcon,
  InboxIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/projects", label: "Projeler", icon: FolderIcon },
  { href: "/admin/gallery", label: "Galeri", icon: PhotoIcon },
  { href: "/admin/uploads", label: "Yüklemeler", icon: CloudArrowUpIcon },
  { href: "/admin/users", label: "Kullanıcılar", icon: UsersIcon },
  { href: "/admin/messages", label: "Mesajlar", icon: InboxIcon },
  { href: "/admin/settings", label: "Ayarlar", icon: Cog6ToothIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu dinle (Mobil/Desktop ayrımı için)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // İlk yüklemede kontrol et
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sidebar İçeriği
  const SidebarContent = ({ collapsed }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo Alanı */}
      <div className={`flex items-center gap-3 px-2 mb-8 h-12 transition-all duration-300 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 min-w-[32px] rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
          H
        </div>
        {/* Yazı sadece açıkken görünür */}
        <div className={`text-xl font-extrabold tracking-tight text-white whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
          Heptapus<span className="text-sky-400">.</span>Admin
        </div>
      </div>

      {/* Menü */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : ""} // Kapalıyken tooltip gibi çalışsın
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 
                ${isActive 
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <Icon className={`w-6 h-6 min-w-[24px] transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-sky-400"}`} />
              
              <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer (Kullanıcı Profili) */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-800/50 border border-white/5 transition-all ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 min-w-[32px] rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
            ADM
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in zoom-in duration-300">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@heptapus.com</p>
            </div>
          )}
          
          {!collapsed && (
            <button className="text-slate-500 hover:text-red-400 transition">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    // Ana kapsayıcı: Ekran boyu kadar yükseklik, taşmayı engelle
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30">
      
      {/* === Desktop Sidebar (Statik - Flex Item) === */}
      {/* Fixed yerine Flex yapısında olduğu için içerik bunun yanına gelir, altına girmez */}
      <aside 
        className={`hidden md:flex flex-col border-r border-white/5 bg-slate-900/50 backdrop-blur-xl p-4 transition-all duration-300 ease-in-out relative
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <SidebarContent collapsed={isCollapsed} />
        
        {/* Toggle Button (Collapse) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-full p-1 shadow-lg transition-transform hover:scale-110 z-50"
        >
          {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </aside>

      {/* === Mobile Overlay & Sidebar === */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-slate-900 border-r border-white/10 p-6 shadow-2xl animate-in slide-in-from-left duration-300 h-full">
            <button
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <SidebarContent collapsed={false} />
          </div>
        </div>
      )}

      {/* === Main Content Wrapper === */}
      {/* flex-1 sayesinde kalan tüm boşluğu kaplar. overflow-hidden ile dış scrollu engelleriz */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-slate-100">
              {navItems.find((i) => i.href === pathname)?.label || "Heptapus Panel"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <span className="hidden sm:inline text-xs font-medium text-emerald-500">Sistem Online</span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        {/* overflow-y-auto buraya verildiği için sadece içerik scroll olur, sidebar ve header sabit kalır */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 min-h-[calc(100vh-140px)]">
            {children}
          </div>

          {/* Footer - Artık içeriğin en altında, scroll alanının içinde */}
          <footer className="mt-12 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Heptapus Group. Tüm hakları saklıdır.</p>
            <p className="font-mono opacity-50">Viribus unitis, semper fidelis.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}