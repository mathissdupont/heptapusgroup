import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import "@/app/globals.css";
import CorporateNav from "@/components/CorporateNav";
import MobileNav from "@/components/MobileNav";
import { getSettings } from "@/lib/settings";
import BackgroundCanvasShell from '@/components/BackgroundCanvasShell';
import { ThemeProvider } from "@/components/ThemeProvider";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";

// Sözlükleri import et
import tr from "@/dictionaries/tr.json";
import en from "@/dictionaries/en.json";

const dictionaries = { tr, en };

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

  const title = siteTitle || t.metadata.title;
  const desc = description || t.metadata.description;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      siteName: "Heptapus Group",
      type: "website",
      locale: lang === "tr" ? "tr_TR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
    metadataBase: new URL("https://heptapusgroup.com"),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const t = dictionaries[lang];

  const { siteTitle, twitter: dbTwitter, github: dbGithub, linkedin: dbLinkedin, instagram: dbInstagram, email: dbEmail } = await getSettings([
    "siteTitle",
    "twitter",
    "github",
    "linkedin",
    "instagram",
    "email",
  ]);

  const email = dbEmail || "contact@heptapusgroup.com";
  const linkedin = dbLinkedin || "https://www.linkedin.com/company/heptapusgroup";
  const instagram = dbInstagram || "https://www.instagram.com/heptapusgroup";
  const github = dbGithub || "https://github.com/heptapusgroup";
  const twitter = dbTwitter || "https://x.com/heptapusgroup";

  const brandFull = "Heptapus";
  const brandSub = t.brand_subtitle;
  const slogan = t.slogan;

  const navItems = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.projects, href: "/projects" },
    { label: t.nav.team, href: "/team" },
    { label: t.nav.contact, href: "/contact" },
  ];

  const year = new Date().getFullYear();

  // JSON-LD Organization structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Heptapus Group",
    url: "https://heptapusgroup.com",
    logo: "https://heptapusgroup.com/icons/heptapus_logo_white.png",
    description: t.footer.description,
    sameAs: [linkedin, github, instagram, twitter].filter(Boolean),
  };

  return (
    <html lang={lang} className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {/* Skip to content — accessibility */}
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg">
            {t.skip_to_content}
          </a>

          {/* JSON-LD */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          <BackgroundCanvasShell />

          {/* NAV */}
          <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto w-[92%] max-w-[1120px]">
              <div className="hidden md:block">
                <CorporateNav
                  items={navItems}
                  brand={brandFull}
                  brandSub={brandSub}
                />
              </div>
              <div className="md:hidden">
                <MobileNav
                  brand={brandFull}
                  brandSub={brandSub}
                  items={navItems}
                />
              </div>
            </div>
          </header>

          {/* PAGE */}
          <main id="main-content" className="relative z-10">{children}</main>

          {/* FOOTER — Multi-column corporate */}
          <footer className="relative z-0 mt-12 border-t border-border bg-card/50">
            <div className="mx-auto w-[92%] max-w-[1120px] py-12">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {/* Column 1: Brand */}
                <div>
                  <Link href="/" className="inline-flex items-center gap-2 font-bold text-foreground no-underline mb-3">
                    <img src="/icons/heptapus_logo_white.png" alt="" width={28} height={28} className="dark:invert-0 invert" />
                    <span className="text-lg">Heptapus</span>
                  </Link>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">{t.footer.description}</p>
                  <p className="text-sm text-muted-foreground italic mt-3">{slogan}</p>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">{t.footer.quick_links}</h4>
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Legal */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">{t.footer.legal}</h4>
                  <ul className="space-y-2">
                    <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">{t.footer.privacy}</Link></li>
                    <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">{t.footer.terms}</Link></li>
                    <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">{t.footer.kvkk}</Link></li>
                  </ul>
                </div>

                {/* Column 4: Contact & Social */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">{t.footer.contact_title}</h4>
                  <ul className="space-y-2">
                    {email && (
                      <li>
                        <a href={`mailto:${email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline inline-flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                          {email}
                        </a>
                      </li>
                    )}
                    {instagram && (
                      <li>
                        <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline inline-flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                          Instagram
                        </a>
                      </li>
                    )}
                    {linkedin && (
                      <li>
                        <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline inline-flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                          LinkedIn
                        </a>
                      </li>
                    )}
                    {github && (
                      <li>
                        <a href={github} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline inline-flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                          GitHub
                        </a>
                      </li>
                    )}
                    {twitter && (
                      <li>
                        <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline inline-flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          X
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                <div>© {year} Heptapus Group. {t.footer.rights}</div>
                <div className="italic">{t.footer.motto}</div>
              </div>
            </div>
          </footer>

          {/* BackToTop */}
          <BackToTop label={t.back_to_top} />

          {/* Cookie Consent */}
          <CookieConsent
            message={t.cookie_consent.message}
            accept={t.cookie_consent.accept}
            decline={t.cookie_consent.decline}
            learnMore={t.cookie_consent.learn_more}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}