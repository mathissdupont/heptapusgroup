// app/admin/layout.tsx
"use client";
import "../globals.css";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  // Sidebar İçeriği (Hem mobil hem desktop için ortak bileşen)
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
          H
        </div>
        <div className="text-xl font-extrabold tracking-tight text-white">
          Heptapus<span className="text-sky-400">.</span>Admin
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                isActive
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-sky-400"}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer (Kullanıcı Profili) */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-800/50 border border-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            ADM
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">admin@heptapus.com</p>
          </div>
          <button className="text-slate-500 hover:text-red-400 transition">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30">
      {/* === Desktop Sidebar === */}
      <aside className="hidden md:flex w-72 min-w-72 flex-col fixed inset-y-0 left-0 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl p-6 z-40">
        <SidebarContent />
      </aside>

      {/* === Mobile Overlay & Sidebar === */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 min-w-72 bg-slate-900 border-r border-white/10 p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <button
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* === Main Content === */}
      <div className="flex-1 flex flex-col md:pl-72 transition-all duration-300 relative z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
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
            {/* Buraya bildirim ikonu veya başka actionlar eklenebilir */}
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-500">Sistem Online</span>
          </div>
        </header>
        {/* Page Content */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}