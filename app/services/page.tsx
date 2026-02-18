import type { Metadata } from "next";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import SubdomainLayout from "@/components/SubdomainLayout";
import SubdomainServices from "@/components/SubdomainServices";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";

const dictionaries = getDictionaries();

export async function generateMetadata(): Promise<Metadata> {
  const subdomain = await getSubdomain();
  if (subdomain) {
    const config = await getSubdomainConfig(subdomain);
    if (config) {
      return {
        title: `Services | ${config.title}`,
        description: `Explore the services and expertise of ${config.title} - A Division of Heptapus Group`,
      };
    }
  }
  const lang = await getServerLang();
  const t = dictionaries[lang].services;
  return {
    title: t.meta_title,
    description: t.subtitle,
    openGraph: { title: t.meta_title, description: t.subtitle, type: "website" },
  };
}

export default async function ServicesPage() {
  const subdomain = await getSubdomain();

  if (subdomain) {
    const config = await getSubdomainConfig(subdomain);
    if (!config) {
      const { redirect } = await import("next/navigation");
      redirect("https://heptapusgroup.com");
    }
    return (
      <SubdomainLayout subdomain={config}>
        <SubdomainServices subdomain={config} />
      </SubdomainLayout>
    );
  }

  const lang = await getServerLang();
  const t = dictionaries[lang].services;

  // Main domain services page
  const subdomains = await prisma.subdomain.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-foreground mb-3">{t.title}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {subdomains.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">—</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {subdomains.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div
                  className="h-2 w-2 rounded-full mt-2.5 flex-shrink-0"
                  style={{ backgroundColor: s.themeColor || "#7c3aed" }}
                />
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">{s.title}</h2>
                  {s.description && (
                    <p className="text-muted-foreground leading-relaxed mb-4">{s.description}</p>
                  )}
                  <Link
                    href="/contact"
                    className="text-sm font-semibold text-foreground hover:underline"
                  >
                    →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-20 text-center">
        <div className="rounded-2xl border border-border bg-card px-8 py-12 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground mb-3">{t.cta_title}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">{t.cta_description}</p>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg bg-foreground text-background px-6 py-3 font-semibold hover:opacity-90 transition-colors"
          >
            {t.cta_button}
          </Link>
        </div>
      </div>
    </main>
  );
}
