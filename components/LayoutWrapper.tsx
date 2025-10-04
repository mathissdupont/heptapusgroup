"use client";

import { usePathname } from "next/navigation";
import NavWrapper from "@/components/NavWrapper";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import MobileNav from "@/components/MobileNav";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Admin sayfalarında sadece içerik
  if (isAdmin) {
    return <main className="relative z-10">{children}</main>;
  }

  // Normal sayfalar
  return (
    <>
      {/* Arka plan */}
      <BackgroundCanvas />

      {/* === NAV === */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur">
        <div className="mx-auto w-[92%] max-w-[1120px] py-2">
          {/* Desktop nav */}
          <div className="hidden md:block">
            <div className="relative h-[72px]">
              <NavWrapper
                items={[
                  { label: "Home", href: "/" },
                  { label: "About", href: "/about" },
                  { label: "Projects", href: "/projects" },
                  { label: "Team", href: "/team" },
                  { label: "Contact", href: "/contact" },
                ]}
                particleCount={15}
                particleDistances={[90, 10]}
                particleR={100}
                initialActiveIndex={0}
                animationTime={600}
                timeVariance={300}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              />
            </div>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden">
            <MobileNav
              brand="Heptapus"
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Projects", href: "/projects" },
                { label: "Team", href: "/team" },
                { label: "Contact", href: "/contact" },
              ]}
            />
          </div>
        </div>
      </header>

      {/* === SAYFA === */}
      <main className="relative z-10">{children}</main>

      {/* === FOOTER === */}
      <footer className="relative z-0 mt-6 border-t border-white/10 py-6">
        <div className="mx-auto flex w-[92%] max-w-[1120px] flex-wrap items-center justify-between gap-3 text-slate-400">
          <div>© {new Date().getFullYear()} Heptapus. Tüm hakları saklıdır.</div>
          <div className="rounded-full border border-white/10 px-3 py-1">
            Made by Heptapus Team
          </div>
        </div>
      </footer>
    </>
  );
}
