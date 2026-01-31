"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LocaleSwitcher() {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const router = useRouter();

  useEffect(() => {
    // Mevcut dili çerezden oku (Sayfa yüklendiğinde butonun doğru görünmesi için)
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
    
    // 1. Çerezi (Cookie) güncelle (1 yıl geçerli)
    document.cookie = `lang=${newLang}; path=/; max-age=${365 * 24 * 60 * 60}`;
    
    // 2. State'i güncelle
    setLang(newLang);
    
    // 3. SAYFAYI REFRESH ET: Bu en önemlisi! 
    // Sunucu tarafındaki (Server Component) layout ve sayfaların yeni dili tanımasını sağlar.
    router.refresh();
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition text-xs font-bold text-slate-200"
    >
      {/* O an hangi dildeysen diğerini buton metni olarak gösterir veya TR | EN formatı yapar */}
      <span className={lang === "tr" ? "text-sky-400" : "opacity-50"}>TR</span>
      <span className="mx-1 opacity-20">|</span>
      <span className={lang === "en" ? "text-sky-400" : "opacity-50"}>EN</span>
    </button>
  );
}