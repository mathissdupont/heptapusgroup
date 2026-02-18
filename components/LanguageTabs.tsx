"use client";

import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS } from "@/lib/get-dictionary";

interface LanguageTabsProps {
  activeLang: string;
  onChangeLang: (lang: string) => void;
  /** Map of locale → boolean indicating if that locale has content */
  populated?: Record<string, boolean>;
}

/**
 * Reusable language tabs for admin multilingual forms.
 * Shows TR / EN / DE tabs with flag emojis and green dots for populated locales.
 */
export default function LanguageTabs({ activeLang, onChangeLang, populated }: LanguageTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-900 p-1 border border-white/10 w-fit">
      {SUPPORTED_LOCALES.map((loc) => {
        const isActive = activeLang === loc;
        const hasFill = populated?.[loc];
        return (
          <button
            key={loc}
            type="button"
            onClick={() => onChangeLang(loc)}
            className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{LOCALE_FLAGS[loc]}</span>
            <span>{LOCALE_LABELS[loc]}</span>
            {hasFill && !isActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
