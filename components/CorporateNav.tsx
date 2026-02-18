"use client";

import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

type Item = { label: string; href: string };

interface NavProps {
  items: Item[];
  brand?: string;
  brandSub?: string;
  children?: ReactNode; // slot for SearchBar icon
}

/* ─── Full-screen overlay menu (Bosch-style) ─── */
function FullMenu({
  items,
  brand,
  onClose,
}: {
  items: Item[];
  brand: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-background animate-in fade-in duration-150 flex flex-col">
      {/* Top bar */}
      <div className="mx-auto w-[92%] max-w-[1120px] flex items-center justify-between h-16 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 font-bold text-foreground"
        >
          <img
            src="/icons/heptapus_logo_white.png"
            alt=""
            width={32}
            height={32}
            className="shrink-0 dark:invert-0 invert"
          />
          <span className="text-lg tracking-tight font-black">{brand}</span>
        </Link>
        <button
          onClick={onClose}
          className="p-2 text-foreground hover:text-foreground/60 transition-colors"
          aria-label="Close menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Nav items */}
        <nav className="mx-auto w-[92%] max-w-[1120px] pt-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between py-5 border-b border-border/60 text-foreground hover:text-foreground/60 transition-colors group"
            >
              <span className="text-[17px] font-medium">{item.label}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-muted-foreground group-hover:translate-x-1 transition-transform"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </nav>

        {/* Bottom: locale + theme */}
        <div className="mx-auto w-[92%] max-w-[1120px] mt-8 pb-8 flex items-center gap-3">
          <LocaleSwitcher dropUp />
          <ThemeToggle />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Main Nav Bar ─── */
export default function CorporateNav({
  items,
  brand = "Heptapus",
  brandSub,
  children,
}: NavProps) {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Admin pages — no navbar
  if (pathname.startsWith("/admin")) return null;

  // 3 primary items visible on desktop (Bosch-style)
  const primary = items.filter((i) =>
    ["/services", "/about", "/careers"].includes(i.href)
  );

  return (
    <>
      <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-foreground hover:opacity-80 transition-opacity"
        >
          <img
            src="/icons/heptapus_logo_white.png"
            alt=""
            width={32}
            height={32}
            className="shrink-0 dark:invert-0 invert"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-lg tracking-tight font-black">{brand}</span>
            {brandSub && (
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
                {brandSub}
              </span>
            )}
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center">
          {/* Primary text links — visible on lg+ */}
          <nav className="hidden lg:flex items-center mr-4">
            {primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-foreground/60 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Icon row */}
          <div className="flex items-center">
            {/* Contact ✉ */}
            <Link
              href="/contact"
              className="hidden sm:flex p-2.5 text-foreground hover:text-foreground/60 transition-colors"
              aria-label="Contact"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </Link>

            {/* Search slot (SearchBar from layout) */}
            {children}

            {/* Hamburger ☰ */}
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2.5 text-foreground hover:text-foreground/60 transition-colors"
              aria-label="Open menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <FullMenu items={items} brand={brand} onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}
