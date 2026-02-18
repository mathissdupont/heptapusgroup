import { Metadata } from "next";
import FaqClient from "./FaqClient";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";

const dictionaries = getDictionaries();

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = dictionaries[lang].faq_page;
  return {
    title: t.meta_title,
    description: t.subtitle,
    openGraph: { title: t.meta_title, description: t.subtitle, type: "website" },
    twitter: { card: "summary_large_image", title: t.meta_title, description: t.subtitle },
  };
}

export default async function FaqPage() {
  const lang = await getServerLang();
  const t = dictionaries[lang].faq_page;
  return <FaqClient t={t} lang={lang} />;
}
