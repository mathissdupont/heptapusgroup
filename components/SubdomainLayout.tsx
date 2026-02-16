// components/SubdomainLayout.tsx
"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";

interface SubdomainLayoutProps {
  children: ReactNode;
  subdomain: {
    name: string;
    title: string;
    description?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    settings?: any;
  };
}

export default function SubdomainLayout({ children, subdomain }: SubdomainLayoutProps) {
  const themeColor = subdomain.themeColor || "#3b82f6";
  const [mobileOpen, setMobileOpen] = useState(false);

  let settings: any = {};
  try {
    settings = typeof subdomain.settings === "string"
      ? JSON.parse(subdomain.settings)
      : subdomain.settings || {};
  } catch { settings = {}; }

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ "--accent": themeColor } as React.CSSProperties}>
      {/* Subdomain Header */}
      <header
        className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl"
        style={{ borderBottomColor: `${themeColor}30` }}
      >
        <div className="mx-auto w-[92%] max-w-[1120px] py-3">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3 no-underline group">
              {subdomain.logoUrl ? (
                <img src={subdomain.logoUrl} alt={subdomain.title} className="h-9 w-9 object-contain" />
              ) : (
                <div
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  {subdomain.title.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-lg font-bold text-foreground group-hover:opacity-80 transition-opacity">
                  {subdomain.title}
                </span>
                {settings.tagline && (
                  <span className="hidden sm:block text-xs text-muted-foreground">
                    {settings.tagline}
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="https://heptapusgroup.com"
                className="text-xs px-3 py-1.5 rounded-full border text-muted-foreground hover:text-foreground transition-colors no-underline"
                style={{ borderColor: `${themeColor}40` }}
              >
                Heptapus Group ↗
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile nav slide */}
          {mobileOpen && (
            <nav className="md:hidden pt-4 pb-2 border-t border-border mt-3 flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="https://heptapusgroup.com"
                className="text-xs text-muted-foreground no-underline"
                onClick={() => setMobileOpen(false)}
              >
                ← Heptapus Group
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-0 mt-16 border-t bg-card/50" style={{ borderTopColor: `${themeColor}20` }}>
        <div className="mx-auto w-[92%] max-w-[1120px] py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand col */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-7 w-7 rounded-md flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: themeColor }}
                >
                  {subdomain.title.charAt(0)}
                </div>
                <span className="font-bold text-foreground">{subdomain.title}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {subdomain.description || `A division of Heptapus Group`}
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Links</h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2">
                {settings.contactEmail && (
                  <li>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
                    >
                      {settings.contactEmail}
                    </a>
                  </li>
                )}
                <li>
                  <Link
                    href="https://heptapusgroup.com/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
                  >
                    Contact Form ↗
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>© {new Date().getFullYear()} {subdomain.title} — A Division of Heptapus Group</div>
            <Link href="https://heptapusgroup.com" className="text-muted-foreground hover:text-foreground transition-colors no-underline">
              heptapusgroup.com
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
