import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import SplashCursor from "@/components/SplashCursor";
import ContactForm from "./ContactForm";

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

  return (
    <section style={{ maxWidth: 1120, width: "92%", margin: "0 auto", padding: "56px 0" }}>
      <SplashCursor />

      {/* Form metinlerini ContactForm'a prop olarak gönderiyoruz */}
      <ContactForm t={t.form} />

      <div style={{ marginTop: 24, color: "#9fb0c3" }}>
        <div>
          {t.email_label}:{" "}
          <a href="mailto:contact@heptapusgroup.com" style={{ color: "#e6edf3" }}>
            contact@heptapusgroup.com
          </a>
        </div>
        <div>
          {t.github_label}:{" "}
          <a href="https://github.com/heptapusgroup" target="_blank" rel="noreferrer" style={{ color: "#e6edf3" }}>
            github.com/heptapus
          </a>
        </div>
      </div>
    </section>
  );
}