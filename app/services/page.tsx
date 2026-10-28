import type { Metadata } from "next";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import SubdomainLayout from "@/components/SubdomainLayout";
import SubdomainServices from "@/components/SubdomainServices";
import { getServiceCatalog } from "@/lib/services";
import ServiceCatalog from "@/components/ServiceCatalog";
import CtaBanner from "@/components/CtaBanner";

export const dynamic = 'force-dynamic';
import { redirect } from "next/navigation";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";

const dictionaries = getDictionaries();

export async function generateMetadata(): Promise<Metadata> {
  const subdomain = await getSubdomain();
  if (subdomain) {
    const config = await getSubdomainConfig(subdomain);
    if (config) {
      return {
        title: `Services | ${config.title}`,
        description: `Explore the services and expertise of ${config.title} - A Division of Heptapus Group`,
      };
    }
  }
  const lang = await getServerLang();
  const t = dictionaries[lang].services;
  return {
    title: t.meta_title,
    description: t.subtitle,
    openGraph: { title: t.meta_title, description: t.subtitle, type: "website" },
  };
}

export default async function ServicesPage() {
  const subdomain = await getSubdomain();

  if (subdomain) {
    const config = await getSubdomainConfig(subdomain);
    if (!config) {
      redirect("https://heptapusgroup.com");
    }
    return (
      <SubdomainLayout subdomain={config}>
        <SubdomainServices subdomain={config} />
      </SubdomainLayout>
    );
  }

  const lang = await getServerLang();
  const t = dictionaries[lang].services;

  const services = await getServiceCatalog();

  return (
    <main className="mx-auto w-[92%] max-w-[1120px] py-16 md:py-24">
      <header className="mb-14 md:mb-20 max-w-2xl">
        <p className="division-eyebrow mb-5">Heptapus Group</p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-6">{t.title}</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">{t.subtitle}</p>
      </header>

      {services.length === 0 ? (
        <p className="text-muted-foreground border-y border-border py-10">{t.empty}</p>
      ) : (
        <ServiceCatalog items={services} heading="h2" />
      )}
      <div className="mt-20"><CtaBanner title={t.cta_title} description={t.cta_description} buttonText={t.cta_button} /></div>
    </main>
  );
}
