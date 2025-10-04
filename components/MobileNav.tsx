"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

type Item = { label: string; href: string };

function Portal({ children }: { children: React.ReactNode }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
    elRef.current.id = "mobile-nav-portal";
    elRef.current.style.position = "relative";
    elRef.current.style.zIndex = "9999"; // her şeyin üstünde
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
}: { items: Item[]; brand?: string }) {
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
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-slate-100">
          <img src="/icons/heptapus_logo_white.png" alt="" width={28} height={28} className="shrink-0" />
          <span className="sr-only">{brand}</span>
        </Link>
        <button
          aria-label="Menüyü aç"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200 active:scale-[.98]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* SLIDE OVER (PORTAL ile body’ye) */}
      {open && (
        <Portal>
          <div className="fixed inset-0 z-[200] pointer-events-auto">
            {/* koyu backdrop; blur hafif */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200 opacity-100"
              onClick={() => setOpen(false)}
            />
            {/* SOLID panel (opak) */}
            <div
              ref={panelRef}
              className="absolute right-0 top-0 h-full w-[84%] max-w-[380px]
                         bg-slate-950 text-slate-100 border-l border-white/10 p-5
                         shadow-[0_10px_30px_rgba(0,0,0,.55)]
                         transition-transform duration-300 translate-x-0"
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <img src="/icons/heptapus_logo_white.png" alt="" width={26} height={26} className="shrink-0" />
                  <span className="font-extrabold">{brand}</span>
                </div>
                <button
                  aria-label="Menüyü kapat"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200"
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
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold hover:bg-white/[.08]"
                  >
                    {it.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 grid gap-2">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-gradient-to-r from-sky-400 to-violet-400 px-4 py-3 text-center font-bold text-slate-900"
                >
                  Teklif Al
                </Link>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
