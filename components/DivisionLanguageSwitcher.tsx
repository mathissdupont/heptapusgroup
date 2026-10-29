"use client";
import { useEffect, useRef } from "react";
import { privacyText } from "@/lib/privacy-copy";
import type { Locale } from "@/lib/get-dictionary";

export default function DivisionLanguageSwitcher({ name, locale, prefix, pathname, versions }: {
  name: string; locale: Locale; prefix: string; pathname: string;
  versions: { locale: string; prefix: string; paths: string[] }[];
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) { if (!ref.current?.contains(event.target as Node)) ref.current?.removeAttribute("open"); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape" && ref.current?.open) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); } }
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, []);
  if (versions.length < 2) return null;
  return <details ref={ref} className="division-language">
    <summary aria-label={privacyText(locale).lang}>{locale.toUpperCase()}<span aria-hidden="true">⌄</span></summary>
    <nav aria-label={privacyText(locale).lang}>{versions.map(version => <a key={version.locale}
      href={`https://${name}.heptapusgroup.com${version.prefix}${version.paths.includes(pathname) && pathname !== "/" ? pathname : ""}`}
      hrefLang={version.locale} lang={version.locale} aria-current={version.prefix === prefix ? "true" : undefined}>
      {({ tr: "Türkçe", en: "English", de: "Deutsch" } as Record<string, string>)[version.locale] || version.locale}
    </a>)}</nav>
  </details>;
}
