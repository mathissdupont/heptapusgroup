import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import TeamGrid from "./TeamGrid";
import Breadcrumb from "@/components/Breadcrumb";
import { RoleKey } from "@/lib/roleThemes";
import { getSettings } from "@/lib/settings";

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
  const t = dictionaries[lang].team;
  return { title: t.meta_title };
}

export default async function TeamPage() {
  const lang = await getLang();
  const t = dictionaries[lang].team;
  const nav = dictionaries[lang].nav;

  // Logo URL'lerini DB'den al (fallback olarak hardcoded URL'ler)
  const logoKeys = [
    "logo_heptanet", "logo_heptaware", "logo_heptacore",
    "logo_heptadynamics", "logo_heptasense", "logo_heptaflux", "logo_heptashield",
  ];
  const logos = await getSettings(logoKeys);

  const defaultLogos: Record<string, string> = {
    logo_heptanet: "https://heptapusgroup.com/uploads/1768586881497-heptanetseffaf.png",
    logo_heptaware: "https://heptapusgroup.com/uploads/1768586872270-heptawareseffaf.png",
    logo_heptacore: "https://heptapusgroup.com/uploads/1768586866431-heptacoreseffaf.png",
    logo_heptadynamics: "https://heptapusgroup.com/uploads/1768587162253-heptadynamicsseffaf.png",
    logo_heptasense: "https://heptapusgroup.com/uploads/1768587161613-heptasenseseffaf.png",
    logo_heptaflux: "https://heptapusgroup.com/uploads/1768587373357-heptafluxseffaf.png",
    logo_heptashield: "https://heptapusgroup.com/uploads/1768587432121-heptashieldseffaf.png",
  };

  const logo = (key: string) => logos[key] || defaultLogos[key] || "";

  // Şirket listesini dinamik metinlerle oluşturuyoruz
  const companies = [
    {
      name: "HeptaNet",
      handle: "heptanet",
      role: "backend" as RoleKey,
      avatarUrl: logo("logo_heptanet"),
      contactHref: "https://net.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/server.svg",
      title: t.companies.heptanet.title,
      status: t.companies.heptanet.status,
      contactText: lang === "tr" ? "Altyapı" : "Infrastructure",
    },
    {
      name: "HeptaWare",
      handle: "heptaware",
      role: "software" as RoleKey,
      avatarUrl: logo("logo_heptaware"),
      contactHref: "https://ware.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/code-bracket.svg",
      title: t.companies.heptaware.title,
      status: t.companies.heptaware.status,
      contactText: "SaaS",
    },
    {
      name: "HeptaCore",
      handle: "heptacore",
      role: "qa" as RoleKey,
      avatarUrl: logo("logo_heptacore"),
      contactHref: "https://core.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/cpu-chip.svg",
      title: t.companies.heptacore.title,
      status: t.companies.heptacore.status,
      contactText: lang === "tr" ? "Çekirdek" : "Kernel",
    },
    {
      name: "HeptaDynamics",
      handle: "heptadynamics",
      role: "mechanical" as RoleKey,
      avatarUrl: logo("logo_heptadynamics"),
      contactHref: "https://dynamics.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/cog-6-tooth.svg",
      title: t.companies.heptadynamics.title,
      status: t.companies.heptadynamics.status,
      contactText: lang === "tr" ? "Robotik" : "Robotics",
    },
    {
      name: "HeptaSense",
      handle: "heptasense",
      role: "frontend" as RoleKey,
      avatarUrl: logo("logo_heptasense"),
      contactHref: "https://sense.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/wifi.svg",
      title: t.companies.heptasense.title,
      status: t.companies.heptasense.status,
      contactText: "IoT",
    },
    {
      name: "HeptaFlux",
      handle: "heptaflux",
      role: "design" as RoleKey,
      avatarUrl: logo("logo_heptaflux"),
      contactHref: "https://flux.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/bolt.svg",
      title: t.companies.heptaflux.title,
      status: t.companies.heptaflux.status,
      contactText: lang === "tr" ? "Enerji" : "Energy",
    },
    {
      name: "HeptaShield",
      handle: "heptashield",
      role: "security" as RoleKey,
      avatarUrl: logo("logo_heptashield"),
      contactHref: "https://shield.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/shield-check.svg",
      title: t.companies.heptashield.title,
      status: t.companies.heptashield.status,
      contactText: lang === "tr" ? "Savunma" : "Defense",
    }
  ];

  return (
    <section className="mx-auto max-w-[1200px] w-[95%] py-16">
      <Breadcrumb items={[{ label: nav.home, href: "/" }, { label: nav.team }]} />
      <div className="text-center mb-14">
        <h1 className="m-0 text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg max-w-[600px] mx-auto">
          {t.subtitle}
        </p>
      </div>
      
      <TeamGrid items={companies} />
    </section>
  );
}