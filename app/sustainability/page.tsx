import { Metadata } from "next";
import { Leaf, Recycle, Globe, Lightbulb } from "lucide-react";
import Link from "next/link";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";

const dictionaries = getDictionaries();

const PILLAR_ICONS = [Leaf, Recycle, Globe, Lightbulb];

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = dictionaries[lang].sustainability_page;
  return {
    title: t.meta_title,
    description: t.subtitle,
    openGraph: { title: t.meta_title, description: t.subtitle, type: "website" },
  };
}

export default async function SustainabilityPage() {
  const lang = await getServerLang();
  const t = dictionaries[lang].sustainability_page;
  const pillars = (t as any).pillars as { title: string; desc: string }[];

  return (
    <main className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-foreground mb-3">{t.title}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {pillars.map((p, i) => {
          const Icon = PILLAR_ICONS[i] || Leaf;
          return (
            <div key={p.title} className="rounded-xl border border-border bg-card p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/30">
                <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{p.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Commitment section */}
      <div className="rounded-2xl bg-secondary/30 p-8 md:p-12 text-center mb-20">
        <h2 className="text-2xl font-bold text-foreground mb-4">{t.commitment_title}</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">{t.commitment_text}</p>
      </div>

      <div className="text-center">
        <div className="rounded-2xl border border-border bg-card px-8 py-12 shadow-lg inline-block">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t.cta_title}</h2>
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
