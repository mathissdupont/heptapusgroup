"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BlurText from "@/components/BlurText";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/home"); // 4 saniye sonra home'a yönlendir
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

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

      {/* Heptapus Group */}
      <BlurText
        text="Heptapus Group"
        delay={150}
        animateBy="words"
        direction="top"
        className="text-4xl md:text-6xl font-bold text-white mb-4 mt-6"
      />

      {/* Viribus Unitis, Semper Fidelis */}
      <BlurText
        text="Viribus Unitis, Semper Fidelis"
        delay={250}
        animateBy="words"
        direction="bottom"
        className="text-lg md:text-2xl font-medium text-slate-400"
      />

      {/* Animations */}
      <style jsx global>{`
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}
