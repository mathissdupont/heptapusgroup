import type { Metadata } from "next";
import ProjectsClient from "./ProjectsClient";
import Breadcrumb from "@/components/Breadcrumb";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";

const dictionaries = getDictionaries();

const getLang = getServerLang;

export async function generateMetadata(): Promise<Metadata> {
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