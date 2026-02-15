"use client";

import { useState, useEffect } from "react";

export default function LocaleSwitcher() {
  const [lang, setLang] = useState<"tr" | "en">("tr");

  useEffect(() => {
    const savedLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("lang="))
      ?.split("=")[1];
    
    if (savedLang === "tr" || savedLang === "en") {
      setLang(savedLang as "tr" | "en");
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "tr" ? "en" : "tr";
    
    // Cookie güncelle (1 yıl geçerli)
    document.cookie = `lang=${newLang}; path=/; max-age=${365 * 24 * 60 * 60}`;
    
    // Sayfayı tamamen yeniden yükle — hem server hem client component'ler yeni dili alsın
    window.location.reload();
  };

  return (
    <button
      onClick={toggleLanguage}
      className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-colors"
    >
      <span className={lang === "tr" ? "text-primary" : "opacity-50"}>TR</span>
      <span className="mx-1 opacity-20">|</span>
      <span className={lang === "en" ? "text-primary" : "opacity-50"}>EN</span>
    </button>
  );
}