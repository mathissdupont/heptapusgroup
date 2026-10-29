import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { getServerLang } from "@/lib/get-server-lang";
import { type Locale, isValidLocale } from "@/lib/get-dictionary";
import { getLegalSettings } from "@/lib/legal";
import { defaultLegalSettings, legalReviewComplete } from "@/lib/legal-settings";
import { getLegalDocument, legalTitles, type LegalKind } from "@/lib/legal-content";
export type LegalSearch = Promise<{ lang?: string | string[] }>;
async function language(searchParams?: LegalSearch): Promise<Locale> {
  const value = (await searchParams)?.lang;
  return typeof value === "string" && isValidLocale(value) ? value : getServerLang();
}
async function settings() { try { return await getLegalSettings(); } catch { return defaultLegalSettings; } }
export async function legalMetadata(kind: LegalKind, searchParams?: LegalSearch): Promise<Metadata> {
  const locale = await language(searchParams), config = await settings();
  return { title: `${legalTitles[locale][kind]} | Heptapus Group`, alternates: { canonical: `https://heptapusgroup.com/${kind}?lang=${locale}`, languages: { tr: `https://heptapusgroup.com/${kind}?lang=tr`, en: `https://heptapusgroup.com/${kind}?lang=en`, de: `https://heptapusgroup.com/${kind}?lang=de` } }, robots: { index: legalReviewComplete(config), follow: true } };
}
export default async function LegalDocument({ kind, searchParams }: { kind: LegalKind; searchParams?: LegalSearch }) {
  const locale = await language(searchParams), config = await settings();
  const document = getLegalDocument(kind, locale, config);
  return <article lang={locale} className="legal-document mx-auto w-[92%] max-w-[1000px] py-12 md:py-20">
    <nav aria-label="Legal" className="flex flex-wrap gap-2 mb-8">{(["privacy", "kvkk", "cookies", "consent", "terms"] as const).map(key => <a key={key} href={`/${key}?lang=${locale}`} aria-current={key === kind ? "page" : undefined}>{legalTitles[locale][key]}</a>)}</nav>
    <div className="flex flex-wrap gap-2 mb-6">{(["tr", "en", "de"] as const).map(lang => <a className="privacy-control" key={lang} href={`/${kind}?lang=${lang}`} hrefLang={lang} lang={lang}>{({ tr: "Türkçe", en: "English", de: "Deutsch" })[lang]}</a>)}</div>
    <header><h1>{document.title}</h1><p>{document.intro}</p><p>{({ tr: "Metin sürümü", en: "Content version", de: "Inhaltsversion" })[locale]}: <time dateTime={document.version}>{document.version}</time></p></header>
    {document.review && <aside className="legal-review">{document.review}</aside>}
    <nav aria-label={document.title} className="legal-contents">{document.sections.map(section => <a href={`#${section.id}`} key={section.id}>{section.title}</a>)}</nav>
    {document.sections.map(section => <section id={section.id} key={section.id}><h2>{section.title}</h2><p>{section.text}</p>{section.items && <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>}</section>)}
    {document.extra && <section className="division-prose"><ReactMarkdown>{document.extra}</ReactMarkdown></section>}
    <footer className="border-t border-border mt-8 pt-6 text-sm"><a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a><p>{({ tr: "Başvuruya gereksiz hassas bilgi eklemeyin. Bu sayfanın güncellenmesi önceki izinleri genişletmez.", en: "Do not include unnecessary sensitive information in requests. Updating this page does not broaden prior permissions.", de: "Fügen Sie Anfragen keine unnötigen sensiblen Daten bei. Aktualisierungen erweitern frühere Einwilligungen nicht." })[locale]}</p></footer>
  </article>;
}
