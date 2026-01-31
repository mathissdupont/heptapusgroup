import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import "@/app/globals.css";
import NavWrapper from "@/components/NavWrapper";
import MobileNav from "@/components/MobileNav";
import { getSettings } from "@/lib/settings";
import BackgroundCanvasShell from '@/components/BackgroundCanvasShell';
import SplashCursor from "@/components/SplashCursor"; // Mouse efekti bileşeni

// Sözlükleri import et
import tr from "@/dictionaries/tr.json";
import en from "@/dictionaries/en.json";

const dictionaries = { tr, en };

export const dynamic = "force-dynamic";

// Dil tespit fonksiyonu
async function getLang() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("lang")?.value;
  if (langCookie === "tr" || langCookie === "en") return langCookie;

  const headerList = await headers();
  return headerList.get("accept-language")?.startsWith("tr") ? "tr" : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = dictionaries[lang];
  const { siteTitle, description } = await getSettings(["siteTitle", "description"]);

  return {
    title: siteTitle || t.metadata.title,
    description: description || t.metadata.description,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const t = dictionaries[lang];

  const { siteTitle, twitter, github, linkedin } = await getSettings([
    "siteTitle",
    "twitter",
    "github",
    "linkedin",
  ]);

  const navItems = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.projects, href: "/projects" },
    { label: t.nav.team, href: "/team" },
    { label: t.nav.contact, href: "/contact" },
  ];

  return (
    <html lang={lang} className="h-full">
      <body className="min-h-full" style={{ background: "#010b1eff", color: "#e6edf3" }}>
        
        {/* MOUSE EFEKTİ - Katman olarak en üstte ama tıklanabilirliği engellemez */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
          <SplashCursor />
        </div>

        <BackgroundCanvasShell />

        {/* NAV */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur">
          <div className="mx-auto w-[92%] max-w-[1120px] py-2">
            <div className="hidden md:block">
              <div className="relative h-[72px]">
                <NavWrapper
                  items={navItems}
                  particleCount={15}
                  particleDistances={[90, 10]}
                  particleR={100}
                  animationTime={600}
                  timeVariance={300}
                  colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                />
              </div>
            </div>
            <div className="md:hidden">
              <MobileNav
                brand={siteTitle || "Heptapus"}
                items={navItems}
              />
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="relative z-10">{children}</main>

        {/* FOOTER */}
        <footer className="relative z-0 mt-6 border-t border-white/10 py-6">
          <div className="mx-auto flex w-[92%] max-w-[1120px] flex-wrap items-center justify-between gap-3 text-slate-400">
            <div>© {new Date().getFullYear()} {siteTitle || "Heptapus"}. {t.footer.rights}</div>
            <div className="flex gap-3">
              <div>{t.footer.motto}</div>
              {twitter && <a href={twitter} target="_blank" className="hover:text-sky-400">Twitter</a>}
              {github && <a href={github} target="_blank" className="hover:text-sky-400">GitHub</a>}
              {linkedin && <a href={linkedin} target="_blank" className="hover:text-sky-400">LinkedIn</a>}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}