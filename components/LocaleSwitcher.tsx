"use client";

import { useState, useEffect, useRef } from "react";
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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectLanguage = (locale: Locale) => {
    document.cookie = `lang=${locale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    setLang(locale);
    setOpen(false);
    window.location.reload();
  };

  return (
    <div ref={ref} className="relative">
      <button
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

      {open && (
        <div className={`absolute right-0 z-50 min-w-[140px] rounded-lg border border-border bg-card shadow-lg overflow-hidden animate-in fade-in duration-150 ${dropUp ? 'bottom-full mb-1 slide-in-from-bottom-1' : 'top-full mt-1 slide-in-from-top-1'}`}>
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
      )}
    </div>
  );
}