import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import ProjectsClient from "./ProjectsClient";
import Breadcrumb from "@/components/Breadcrumb";

// Sözlükler
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
  const t = dictionaries[lang].projects_list;

  return {
    title: t.meta_title,
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