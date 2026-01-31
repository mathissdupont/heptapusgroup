import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import TeamGrid from "./TeamGrid";
import { RoleKey } from "@/lib/roleThemes";

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

  // Şirket listesini dinamik metinlerle oluşturuyoruz
  const companies = [
    {
      name: "HeptaNet",
      handle: "heptanet",
      role: "backend" as RoleKey,
      avatarUrl: "https://heptapusgroup.com/uploads/1768586881497-heptanetseffaf.png",
      contactHref: "https://net.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/server.svg",
      // Çeviriler
      title: t.companies.heptanet.title,
      status: t.companies.heptanet.status,
      contactText: lang === "tr" ? "Altyapı" : "Infrastructure",
    },
    {
      name: "HeptaWare",
      handle: "heptaware",
      role: "software" as RoleKey,
      avatarUrl: "https://heptapusgroup.com/uploads/1768586872270-heptawareseffaf.png",
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
      avatarUrl: "https://heptapusgroup.com/uploads/1768586866431-heptacoreseffaf.png",
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
      avatarUrl: "https://heptapusgroup.com/uploads/1768587162253-heptadynamicsseffaf.png",
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
      avatarUrl:"https://heptapusgroup.com/uploads/1768587161613-heptasenseseffaf.png",
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
      avatarUrl: "https://heptapusgroup.com/uploads/1768587373357-heptafluxseffaf.png",
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
      avatarUrl: "https://heptapusgroup.com/uploads/1768587432121-heptashieldseffaf.png",
      contactHref: "https://shield.heptapus.com",
      iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/shield-check.svg",
      title: t.companies.heptashield.title,
      status: t.companies.heptashield.status,
      contactText: lang === "tr" ? "Savunma" : "Defense",
    }
  ];

  return (
    <section style={{ maxWidth: 1200, width: "95%", margin: "0 auto", padding: "64px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h1 style={{ margin: 0, fontSize: "3rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
          {t.title}
        </h1>
        <p style={{ color: "#9fb0c3", marginTop: 16, fontSize: "1.2rem", maxWidth: "600px", marginInline: "auto" }}>
          {t.subtitle}
        </p>
      </div>
      
      <TeamGrid items={companies} />
    </section>
  );
}