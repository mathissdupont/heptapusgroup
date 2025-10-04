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

  return (

    <div className="flex min-h-screen bg-slate-950 text-slate-200" style={{ zIndex: 5 }}>
      {/* === Sidebar (Desktop) === */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-slate-900 p-6">
        <div className="text-2xl font-extrabold mb-8">Heptapus Admin</div>
        <nav className="grid gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 border transition ${
                  isActive
                    ? "border-sky-400/50 bg-sky-400/10 text-sky-300"
                    : "border-white/10 hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* === Mobile Sidebar === */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar */}
          <div className="relative w-64 bg-slate-900 border-r border-white/10 p-6 z-50">
            <button
              className="absolute top-4 right-4"
              onClick={() => setMobileOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="text-2xl font-extrabold mb-8">Heptapus Admin</div>
            <nav className="grid gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded px-3 py-2 border transition ${
                      isActive
                        ? "border-sky-400/50 bg-sky-400/10 text-sky-300"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* === Content === */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
