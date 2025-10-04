"use client";
import { useEffect, useState } from "react";

export default function HeaderChrome({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 backdrop-blur-md transition-all duration-300",
        // üstte çok şeffaf, kayınca biraz daha opak
        scrolled
          ? "bg-slate-950/55"
          : "bg-slate-950/25",
        // sert border yerine çok hafif inset çizgi
        "shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]",
      ].join(" ")}
    >
      {/* altta gradient çizgiyi daha da yumuşatır */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-[24px] bg-gradient-to-b from-white/5 to-transparent" />
      {children}
    </header>
  );
}
