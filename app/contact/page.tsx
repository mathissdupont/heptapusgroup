import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import Breadcrumb from "@/components/Breadcrumb";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import SubdomainLayout from "@/components/SubdomainLayout";
import SubdomainContact from "@/components/SubdomainContact";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";

const dictionaries = getDictionaries();

const getLang = getServerLang;

export async function generateMetadata(): Promise<Metadata> {
  // If on subdomain, generate subdomain-specific metadata
  const subdomain = await getSubdomain();
  if (subdomain) {
    const config = await getSubdomainConfig(subdomain);
    if (config) {
      return {
        title: `Contact | ${config.title}`,
        description: `Get in touch with ${config.title} - A Division of Heptapus Group`,
      };
    }
  }

  const lang = await getLang();
  const t = dictionaries[lang].contact;
  const desc = t.description || "Get in touch with Heptapus Group for questions, collaborations, or partnership opportunities.";

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

export default async function ContactPage() {
  // Subdomain check
  const subdomain = await getSubdomain();
  if (subdomain) {
    const config = await getSubdomainConfig(subdomain);
    if (config) {
      return (
        <SubdomainLayout subdomain={config}>
          <SubdomainContact subdomain={config} />
        </SubdomainLayout>
      );
    }
  }

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