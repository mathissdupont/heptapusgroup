import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";

const dictionaries = getDictionaries();

const getLang = getServerLang;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = dictionaries[lang].terms_page;
  return { title: t.meta_title };
}

export default async function TermsPage() {
  const lang = await getLang();
  const t = dictionaries[lang].terms_page;
  const nav = dictionaries[lang].nav;

  return (
    <section className="mx-auto w-[92%] max-w-[1120px] py-12">
      <Breadcrumb items={[
        { label: nav.home, href: "/" },
        { label: t.title },
      ]} />

      <h1 className="text-3xl font-extrabold text-foreground mb-4">{t.title}</h1>
      <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">{t.intro}</p>

      <div className="space-y-6 max-w-3xl">
        {t.sections.map((s: { h: string; p: string }, i: number) => (
          <div key={i} className="border border-border rounded-2xl bg-card p-5 shadow-sm">
            <h2 className="font-bold text-card-foreground mb-2">{s.h}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
