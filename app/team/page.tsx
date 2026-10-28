import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getPublishedTeam } from "@/lib/team";
import { teamCopy, teamGroups } from "@/lib/team-validation";
import TeamGrid from "./TeamGrid";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = teamCopy[lang];
  return { title: `${t.title} | Heptapus Group`, description: t.description };
}

export default async function TeamPage() {
  const lang = await getServerLang();
  const t = teamCopy[lang];
  const nav = getDictionaries()[lang].nav;
  const members = await getPublishedTeam();

  return <section className="people-page mx-auto w-[92%] max-w-[1120px] py-12 md:py-20">
    <Breadcrumb items={[{ label: nav.home, href: "/" }, { label: nav.team }]} />
    <header className="people-header"><p className="division-eyebrow">Heptapus Group</p><h1>{t.title}</h1><p>{t.description}</p></header>
    {members.length ? teamGroups.map(group => {
      const items = members.filter(member => member.group === group);
      if (!items.length) return null;
      return <section key={group} className="people-section"><div className="people-section-title"><h2>{t[group]}</h2><span>{String(items.length).padStart(2, "0")}</span></div><TeamGrid items={items} profileLabel={t.profile} /></section>;
    }) : <p className="border-y border-border py-12 text-muted-foreground">{t.empty}</p>}
  </section>;
}
