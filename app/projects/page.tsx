import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import ProjectsClient from "./ProjectsClient";

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

  // Client bileşenine çevirileri prop olarak gönderiyoruz
  return <ProjectsClient t={t} lang={lang} />;
}