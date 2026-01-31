"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BlurText from "@/components/BlurText";

// JSON dosyalarını import ediyoruz
import tr from "@/dictionaries/tr.json";
import en from "@/dictionaries/en.json";

const dictionaries = { tr, en };

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"tr" | "en">("en"); // Varsayılan dil en

  useEffect(() => {
    // Tarayıcı dilini kontrol et (veya localStorage/cookie'den al)
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "tr") {
      setLang("tr");
    }

    const timer = setTimeout(() => {
      router.push("/home");
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  // Aktif sözlük
  const t = dictionaries[lang].landing;

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#010b1e] text-center">
      {/* Logo */}
      <div className="relative flex items-center justify-center">
        <img
          src="/icons/heptapus_logo_white.png"
          alt="Heptapus Logo"
          className="w-24 h-24 drop-shadow-[0_0_25px_rgba(6,182,212,0.9)] animate-float"
        />
      </div>

      {/* Dinamik Başlık */}
      <BlurText
        text={t.title}
        delay={150}
        animateBy="words"
        direction="top"
        className="text-4xl md:text-6xl font-bold text-white mb-4 mt-6"
      />

      {/* Dinamik Motto */}
      <BlurText
        text={t.motto}
        delay={250}
        animateBy="words"
        direction="bottom"
        className="text-lg md:text-2xl font-medium text-slate-400"
      />

      <style jsx global>{`
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}