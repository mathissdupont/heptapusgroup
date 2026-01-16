// app/team/page.tsx
import type { Metadata } from "next";
import TeamGrid from "./TeamGrid";
import { RoleKey } from "@/lib/roleThemes";

export const metadata: Metadata = { title: "Grup Şirketleri | Heptapus Group" };

// Renk kodlarına göre otomatik logo üreten URL yardımcı fonksiyonu
const getPlaceholder = (name: string, color: string) => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=256&bold=true&font-size=0.35`;

const companies = [
  {
    name: "HeptaNet",
    title: "Network & Infrastructure",
    handle: "heptanet",
    status: "Operational",
    role: "backend" as RoleKey, // Mavi Tema
    // Mavi arka planlı otomatik logo
    avatarUrl: getPlaceholder("Hepta Net", "0ea5e9"), 
    contactText: "Altyapı",
    contactHref: "https://net.heptapus.com",
    iconUrl: "/icons/server.svg",
  },
  {
    name: "HeptaWare",
    title: "Software & Digital Systems",
    handle: "heptaware",
    status: "Active",
    role: "software" as RoleKey, // Mor Tema
    // Mor arka planlı otomatik logo
    avatarUrl: getPlaceholder("Hepta Ware", "8b5cf6"),
    contactText: "SaaS",
    contactHref: "https://ware.heptapus.com",
    iconUrl: "/icons/code.svg",
  },
  {
    name: "HeptaCore",
    title: "Systems & Embedded Tech",
    handle: "heptacore",
    status: "Deep Tech",
    role: "qa" as RoleKey, // Yeşil Tema
    // Yeşil arka planlı otomatik logo
    avatarUrl: getPlaceholder("Hepta Core", "10b981"),
    contactText: "Kernel",
    contactHref: "https://core.heptapus.com",
    iconUrl: "/icons/cpu.svg",
  },
  {
    name: "HeptaDynamics",
    title: "Robotics & Mechanics",
    handle: "heptadynamics",
    status: "R&D",
    role: "mechanical" as RoleKey, // Turuncu Tema
    // Turuncu arka planlı otomatik logo
    avatarUrl: getPlaceholder("Hepta Dynamics", "f97316"),
    contactText: "Robotik",
    contactHref: "https://dynamics.heptapus.com",
    iconUrl: "/icons/cog.svg",
  },
  {
    name: "HeptaSense",
    title: "IoT & Sensing Systems",
    handle: "heptasense",
    status: "Online",
    role: "frontend" as RoleKey, // Cyan/Mavi Tema
    // Cyan arka planlı otomatik logo
    avatarUrl: getPlaceholder("Hepta Sense", "06b6d4"),
    contactText: "IoT",
    contactHref: "https://sense.heptapus.com",
    iconUrl: "/icons/wifi.svg",
  },
  {
    name: "HeptaFlux",
    title: "Energy & Thermal Systems",
    handle: "heptaflux",
    status: "Stable",
    role: "design" as RoleKey, // Kırmızı Tema
    // Kırmızı arka planlı otomatik logo
    avatarUrl: getPlaceholder("Hepta Flux", "ef4444"),
    contactText: "Enerji",
    contactHref: "https://flux.heptapus.com",
    iconUrl: "/icons/bolt.svg",
  },
  {
    name: "HeptaShield",
    title: "Security & Defense",
    handle: "heptashield",
    status: "Secured",
    role: "security" as RoleKey, // Koyu Tema
    // Siyah/Gri arka planlı otomatik logo
    avatarUrl: getPlaceholder("Hepta Shield", "1e293b"),
    contactText: "Defense",
    contactHref: "https://shield.heptapus.com",
    iconUrl: "/icons/shield-check.svg",
  }
];

export default function TeamPage() {
  return (
    <section style={{ maxWidth: 1200, width: "95%", margin: "0 auto", padding: "64px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h1 style={{ margin: 0, fontSize: "3rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
          Heptapus<span style={{ color: "#0ea5e9" }}>.</span>Group
        </h1>
        <p style={{ color: "#9fb0c3", marginTop: 16, fontSize: "1.2rem", maxWidth: "600px", marginInline: "auto" }}>
          Dijital dünyadan fiziksel evrene uzanan teknoloji ekosistemi.
        </p>
      </div>
      
      <TeamGrid items={companies} />
    </section>
  );
}