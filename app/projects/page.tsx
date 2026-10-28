import type { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";
import Breadcrumb from "@/components/Breadcrumb";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import { notFound } from "next/navigation";
import SubdomainLayout from "@/components/SubdomainLayout";
import { DivisionProjects } from "@/components/DivisionContent";
import { getDivisionCopy, parseSubdomainSettings } from "@/lib/subdomain-content";

const dictionaries = getDictionaries();

const getLang = getServerLang;

export async function generateMetadata(): Promise<Metadata> {
  const name = await getSubdomain();
  if (name) {
    const config = await getSubdomainConfig(name);
    if (!config) return { title: "Not found" };
    const settings = parseSubdomainSettings(config.settings);
    return { title: getDivisionCopy(settings).projects, description: config.description || undefined };
  }
  const lang = await getLang();
  const t = dictionaries[lang].projects_list;
  const desc = t.description || "Explore our portfolio of innovative projects — from POC/MVPs to production-ready solutions.";

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

export default async function Page() {
  const name = await getSubdomain();
  if (name) {
    const config = await getSubdomainConfig(name);
    if (!config) notFound();
    return <SubdomainLayout subdomain={config}><div className="division-container"><DivisionProjects settings={parseSubdomainSettings(config.settings)} /></div></SubdomainLayout>;
  }
  const lang = await getLang();
  const t = dictionaries[lang].projects_list;

  const nav = dictionaries[lang].nav;

  // Client bileşenine çevirileri prop olarak gönderiyoruz
  return (
    <div className="mx-auto w-[92%] max-w-[1120px] pt-14">
      <Breadcrumb items={[{ label: nav.home, href: "/" }, { label: nav.projects }]} />
      <ProjectsClient t={t} lang={lang} />
    </div>
  );
}
