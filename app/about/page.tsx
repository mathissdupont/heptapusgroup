import { notFound } from "next/navigation";
import DivisionStructuredData from "@/components/DivisionStructuredData";
import { divisionMetadata } from "@/lib/division-seo";
import type { Metadata } from "next";
import BrandLogo from "@/components/BrandLogo";
import Breadcrumb from "@/components/Breadcrumb";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import SubdomainLayout from "@/components/SubdomainLayout";
import SubdomainAbout from "@/components/SubdomainAbout";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getAboutContent } from "@/lib/about";

export const dynamic = "force-dynamic";

const dictionaries = getDictionaries();

const getLang = getServerLang;

export async function generateMetadata(): Promise<Metadata> {
  // If on subdomain, generate subdomain-specific metadata
  const subdomain = await getSubdomain();
  if (subdomain) {
    const config = await getSubdomainConfig(subdomain);
    if (config) {
      return divisionMetadata(config, "/about");
    }
  }

  const lang = await getLang();
  const t = dictionaries[lang].about;
  const desc = t.subtitle || "From software to hardware, energy to AI — building the engineering group of the future.";

  return {
    title: t.meta_title,
    description: desc,
    openGraph: {
      title: t.meta_title,
      description: desc,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta_title,
      description: desc,
    },
  };
}

export default async function AboutPage() {
  // Subdomain check
  const subdomain = await getSubdomain();
  if (subdomain) {
    const config = await getSubdomainConfig(subdomain);
    if (!config) notFound();
    if (config) {
      return (
        <SubdomainLayout subdomain={config}>
          <DivisionStructuredData division={config} path="/about" />
          <SubdomainAbout subdomain={config} />
        </SubdomainLayout>
      );
    }
  }

  const lang = await getLang();
  const t = dictionaries[lang].about;
  const nav = dictionaries[lang].nav;
  const content = (await getAboutContent())[lang];

  return (
    <section className="mx-auto w-[92%] max-w-[1120px] py-16 relative">
      <Breadcrumb items={[
        { label: nav.home, href: "/" },
        { label: nav.about },
      ]} />

      {/* === LOGO + BAŞLIK === */}
      <div className="text-center mb-6">
        <BrandLogo variant="primary" className="mx-auto mb-6" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 text-center">
          {t.title}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-[860px] leading-relaxed text-center text-base">
          {t.subtitle}
        </p>
      </div>

      <div className="hairline-sep" />

      {/* === STATS === */}
      {content.stats.length > 0 && <div className="content-stats-grid gap-4 my-10" data-count={content.stats.length}>
        {content.stats.map((stat, i) => (
          <div key={i} className="text-center border border-border rounded-xl bg-card p-6 shadow-sm">
            <div className="group-stats-number text-3xl md:text-4xl font-medium break-words">{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>}

      {/* === METİNLER === */}
      <div className="max-w-[900px] mx-auto text-center">
        {[t.p1, t.p2, t.p3, t.p4].map((para, idx) => (
          <p key={idx} className="text-muted-foreground leading-relaxed mt-3">
            {para}
          </p>
        ))}

        {/* Kart Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { h: t.mission_h, p: t.mission_p },
            { h: t.vision_h, p: t.vision_p },
            { h: t.values_h, p: t.values_p },
          ].map((x) => (
            <div
              key={x.h}
              className="border border-border rounded-xl bg-card p-5 shadow-sm"
            >
              <h3 className="font-bold text-card-foreground text-center mb-2">
                {x.h}
              </h3>
              <p className="text-muted-foreground text-center leading-relaxed text-sm">
                {x.p}
              </p>
            </div>
          ))}
        </div>

        {/* === TIMELINE === */}
        {content.timeline.length > 0 && <div className="mt-14">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            {content.timelineTitle}
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden sm:block" />
            <div className="space-y-6 sm:space-y-0">
              {content.timeline.map((item, i) => (
                <div key={i} className={`relative sm:flex items-start ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"} sm:mb-8`}>
                  {/* Content */}
                  <div className={`sm:w-[calc(50%-1.5rem)] ${i % 2 === 0 ? "sm:text-right sm:pr-6" : "sm:text-left sm:pl-6"}`}>
                    <div className="border border-border rounded-xl bg-card p-4 shadow-sm">
                      <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold mb-2">{item.year}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.event}</p>
                    </div>
                  </div>
                  {/* Dot */}
                  <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  {/* Spacer for the other side */}
                  <div className="hidden sm:block sm:w-[calc(50%-1.5rem)]" />
                </div>
              ))}
            </div>
          </div>
        </div>}
      </div>
    </section>
  );
}
