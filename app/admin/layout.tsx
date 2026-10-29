// app/admin/layout.tsx
"use client";
import "../globals.css";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useMe } from "@/lib/useMe";
import BrandLogo from "@/components/BrandLogo";
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
  ChevronRightIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  EnvelopeIcon,
  LanguageIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/projects", label: "Projeler", icon: FolderIcon },
  { href: "/admin/team", label: "Ekibimiz", icon: UsersIcon },
  { href: "/admin/about", label: "Hakkımızda", icon: DocumentTextIcon },
  { href: "/admin/gallery", label: "Galeri", icon: PhotoIcon },
  { href: "/admin/uploads", label: "Yüklemeler", icon: CloudArrowUpIcon },
  { href: "/admin/subdomains", label: "Subdomains", icon: GlobeAltIcon },
  { href: "/admin/partners", label: "Partners", icon: BuildingOfficeIcon },
  { href: "/admin/blog", label: "Blog", icon: DocumentTextIcon },
  { href: "/admin/faq", label: "FAQ", icon: QuestionMarkCircleIcon },
  { href: "/admin/careers", label: "Careers", icon: BriefcaseIcon },
  { href: "/admin/announcements", label: "Duyurular", icon: MegaphoneIcon },
  { href: "/admin/subscribers", label: "Subscribers", icon: EnvelopeIcon },
  { href: "/admin/languages", label: "Diller", icon: LanguageIcon },
  { href: "/admin/users", label: "Kullanıcılar", icon: UsersIcon, adminOnly: true },
  { href: "/admin/messages", label: "Mesajlar", icon: InboxIcon, adminOnly: true },
  { href: "/admin/logs", label: "Loglar", icon: CommandLineIcon, adminOnly: true },
  { href: "/admin/audit", label: "İşlem geçmişi", icon: DocumentTextIcon, adminOnly: true },
  { href: "/admin/legal", label: "Hukuki bilgiler", icon: DocumentTextIcon, adminOnly: true },
  { href: "/admin/settings", label: "Ayarlar", icon: Cog6ToothIcon, adminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me, mutate } = useMe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  // Çıkış Yap Fonksiyonu
  const handleLogout = async () => {
    setLogoutError("");
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => null);
    if (!response?.ok) {
      setLogoutError("Çıkış tamamlanamadı. Lütfen tekrar deneyin.");
      return;
    }
    await mutate({ user: null }, { revalidate: false });
    router.replace("/login");
    router.refresh();
  };

  // Sidebar İçeriği (Ortak Bileşen)
  const SidebarContent = ({ collapsed }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo Alanı */}
      <div className="flex flex-col items-center justify-center min-h-[104px] mb-6">
        <BrandLogo variant={collapsed ? "mark" : "horizontal"} tone="light" />
        {!collapsed && <span className="admin-brand-caption">ADMIN</span>}
      </div>

      {/* Menü Linkleri */}
      <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.filter((item) => !item.adminOnly || me?.role === "ADMIN").map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : ""}
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

      {/* Sidebar Footer */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-800/50 border border-white/5 transition-all ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 min-w-[32px] rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white cursor-default">
            {(me?.name || me?.email || "U").slice(0, 2).toUpperCase()}
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in zoom-in duration-300">
              <p className="text-sm font-medium text-white truncate">{me?.name || "Panel kullanıcısı"}</p>
              <p className="text-xs text-slate-500 truncate">{me?.email || "Oturum yükleniyor"}</p>
            </div>
          )}
          
          {!collapsed && (
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
              title="Çıkış Yap"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-shell dark flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30">
      
      {/* === Desktop Sidebar === */}
      <aside 
        className={`hidden md:flex flex-col border-r border-white/5 bg-slate-900/50 backdrop-blur-xl p-4 transition-all duration-300 ease-in-out relative
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        <SidebarContent collapsed={isCollapsed} />
        
        {/* Collapse Toggle Butonu */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-full p-1 shadow-lg transition-transform hover:scale-110 z-50"
        >
          {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>
      </aside>

      {/* === Mobile Sidebar Overlay === */}
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

      {/* === Main Content === */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Header - SADECE MOBİLDE GÖRÜNÜR (md:hidden) */}
        <header className="md:hidden flex-shrink-0 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <span className="font-semibold text-white">Heptapus</span>
          </div>
        </header>

        {/* Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          {/* İçerik Wrapper */}
          <div className="max-w-7xl mx-auto min-h-[calc(100vh-140px)] animate-in fade-in duration-500">
            {logoutError && <p role="alert" className="mb-4 text-red-400">{logoutError}</p>}
            {children}
          </div>

          <footer className="mt-12 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Heptapus Group.</p>
            <p className="font-mono opacity-50">Viribus unitis, semper fidelis.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
