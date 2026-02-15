import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import ContactForm from "./ContactForm";
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
  const t = dictionaries[lang].contact;

  return {
    title: t.meta_title,
  };
}

export default async function ContactPage() {
  const lang = await getLang();
  const t = dictionaries[lang].contact;
  const nav = dictionaries[lang].nav;

  return (
    <section className="mx-auto w-[92%] max-w-[1120px] py-14">
      <Breadcrumb items={[{ label: nav.home, href: "/" }, { label: nav.contact }]} />
      {/* Form metinlerini ContactForm'a prop olarak gönderiyoruz */}
      <ContactForm t={t.form} />

      <div className="mt-6 text-muted-foreground">
        <div>
          {t.email_label}:{" "}
          <a href="mailto:contact@heptapusgroup.com" className="text-foreground hover:underline">
            contact@heptapusgroup.com
          </a>
        </div>
        <div>
          {t.github_label}:{" "}
          <a href="https://github.com/heptapusgroup" target="_blank" rel="noreferrer" className="text-foreground hover:underline">
            github.com/heptapus
          </a>
        </div>
      </div>
    </section>
  );
}