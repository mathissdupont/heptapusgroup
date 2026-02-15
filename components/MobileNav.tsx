"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

type Item = { label: string; href: string };

function Portal({ children }: { children: React.ReactNode }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
    elRef.current.id = "mobile-nav-portal";
    elRef.current.style.position = "relative";
    elRef.current.style.zIndex = "9999";
  }
  useEffect(() => {
    const el = elRef.current!;
    document.body.appendChild(el);
    return () => {
      try { document.body.removeChild(el); } catch {}
    };
  }, []);
  return createPortal(children, elRef.current);
}

export default function MobileNav({
  items,
  brand = "Heptapus",
  brandSub,
}: { items: Item[]; brand?: string; brandSub?: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC ile kapat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Dışarı tıklama ile kapat
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Panel açıkken body scroll kilidi
  useEffect(() => {
    const { style } = document.body;
    const prevOverflow = style.overflow;
    const prevTouch = style.touchAction;
    if (open) {
      style.overflow = "hidden";
      style.touchAction = "none";
    } else {
      style.overflow = prevOverflow || "";
      style.touchAction = prevTouch || "";
    }
    return () => {
      style.overflow = prevOverflow || "";
      style.touchAction = prevTouch || "";
    };
  }, [open]);

  return (
    <>
      {/* top bar */}
      <div className="flex h-16 items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-foreground">
          <img src="/icons/heptapus_logo_white.png" alt="" width={28} height={28} className="shrink-0 dark:invert-0 invert" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm">{brand}</span>
            {brandSub && <span className="text-[9px] font-medium text-muted-foreground tracking-wide uppercase">{brandSub}</span>}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <button
            aria-label="Menüyü aç"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="rounded-lg border border-border bg-secondary/50 p-2 text-foreground active:scale-[.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* SLIDE OVER (PORTAL ile body'ye) */}
      {open && (
        <Portal>
          <div className="fixed inset-0 z-[200] pointer-events-auto">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 opacity-100"
              onClick={() => setOpen(false)}
            />
            {/* Panel */}
            <div
              ref={panelRef}
              className="absolute right-0 top-0 h-full w-[84%] max-w-[380px]
                         bg-background text-foreground border-l border-border p-5
                         shadow-xl
                         transition-transform duration-300 translate-x-0"
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <img src="/icons/heptapus_logo_white.png" alt="" width={26} height={26} className="shrink-0 dark:invert-0 invert" />
                  <span className="font-bold">{brand}</span>
                </div>
                <button
                  aria-label="Menüyü kapat"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border bg-secondary/50 p-2 text-foreground"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="mt-2 grid gap-2">
                {items.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-border bg-secondary/30 px-4 py-3 font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    {it.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
