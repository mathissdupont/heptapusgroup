"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  type Locale,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  LOCALE_FLAGS,
  isValidLocale,
} from "@/lib/get-dictionary";

export default function LocaleSwitcher({ dropUp = false }: { dropUp?: boolean } = {}) {
  const [lang, setLang] = useState<Locale>("tr");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    const savedLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("lang="))
      ?.split("=")[1];

    if (savedLang && isValidLocale(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      // Buton wrapper'ı veya portal menüsü içindeyse kapatma
      if (ref.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Pozisyonu hesapla
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      if (dropUp) {
        setMenuPos({
          top: rect.top - 4, // butonun üstüne
          left: rect.left,
          width: Math.max(140, rect.width),
        });
      } else {
        setMenuPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: Math.max(140, rect.width),
        });
      }
    }
  }, [open, dropUp]);

  const selectLanguage = (locale: Locale) => {
    document.cookie = `lang=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    setLang(locale);
    setOpen(false);
    window.location.reload();
  };

  const dropdownMenu = open && menuPos ? (
    <div
      ref={menuRef}
      className="fixed z-[300] min-w-[140px] rounded-lg border border-border bg-card shadow-lg overflow-hidden animate-in fade-in duration-150"
      style={{
        left: menuPos.left,
        minWidth: menuPos.width,
        ...(dropUp
          ? { bottom: window.innerHeight - menuPos.top, top: "auto" }
          : { top: menuPos.top }),
      }}
    >
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          onClick={() => selectLanguage(locale)}
          className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-secondary ${
            locale === lang
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground"
          }`}
        >
          <span>{LOCALE_FLAGS[locale]}</span>
          <span>{LOCALE_LABELS[locale]}</span>
          {locale === lang && (
            <svg className="ml-auto w-4 h-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      ))}
    </div>
  ) : null;

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
        aria-label="Change language"
        aria-expanded={open}
      >
        <span>{LOCALE_FLAGS[lang]}</span>
        <span>{lang.toUpperCase()}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {typeof document !== "undefined" && dropdownMenu
        ? createPortal(dropdownMenu, document.body)
        : dropdownMenu}
    </div>
  );
}