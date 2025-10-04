import type { Metadata } from "next";
import "@/app/globals.css";
import NavWrapper from "@/components/NavWrapper";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import MobileNav from "@/components/MobileNav";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, description } = await getSettings(["siteTitle", "description"]);

  return {
    title: siteTitle || "Heptapus | Şirketler Grubu",
    description: description || "Heptapus: Projelerimizi gerçek dünyaya taşıyan ekip.",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { siteTitle, twitter, github, linkedin } = await getSettings([
    "siteTitle",
    "twitter",
    "github",
    "linkedin",
  ]);

  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full" style={{ background: "#010b1eff", color: "#e6edf3" }}>
        <BackgroundCanvas />

        {/* NAV */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/40 backdrop-blur">
          <div className="mx-auto w-[92%] max-w-[1120px] py-2">
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
            <div className="md:hidden">
              <MobileNav
                brand={siteTitle || "Heptapus"}
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

        {/* PAGE */}
        <main className="relative z-10">{children}</main>

        {/* FOOTER */}
        <footer className="relative z-0 mt-6 border-t border-white/10 py-6">
          <div className="mx-auto flex w-[92%] max-w-[1120px] flex-wrap items-center justify-between gap-3 text-slate-400">
            <div>© {new Date().getFullYear()} {siteTitle || "Heptapus"}. Tüm hakları saklıdır.</div>
            <div className="flex gap-3">
              <div>Viribus unitis, semper fidelis.</div>
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
