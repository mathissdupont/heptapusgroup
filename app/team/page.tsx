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
    role: "backend" as RoleKey,
    avatarUrl: "https://heptapusgroup.com/uploads/1768586881497-heptanetseffaf.png",
    contactText: "Infrastructure",
    contactHref: "https://net.heptapus.com",
    // Server ikonu (Heroicons CDN)
    iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/server.svg",
  },
  {
    name: "HeptaWare",
    title: "Software & Digital Systems",
    handle: "heptaware",
    status: "Active",
    role: "software" as RoleKey,
    avatarUrl: "https://heptapusgroup.com/uploads/1768586872270-heptawareseffaf.png",
    contactText: "SaaS",
    contactHref: "https://ware.heptapus.com",
    // Code Bracket ikonu
    iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/code-bracket.svg",
  },
  {
    name: "HeptaCore",
    title: "Systems & Embedded Tech",
    handle: "heptacore",
    status: "Deep Tech",
    role: "qa" as RoleKey,
    avatarUrl: "https://heptapusgroup.com/uploads/1768586866431-heptacoreseffaf.png",
    contactText: "Kernel",
    contactHref: "https://core.heptapus.com",
    // CPU Chip ikonu
    iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/cpu-chip.svg",
  },
  {
    name: "HeptaDynamics",
    title: "Robotics & Mechanics",
    handle: "heptadynamics",
    status: "R&D",
    role: "mechanical" as RoleKey,
    avatarUrl: "https://heptapusgroup.com/uploads/1768587162253-heptadynamicsseffaf.png",
    contactText: "Robotics",
    contactHref: "https://dynamics.heptapus.com",
    // Cog (Dişli) ikonu
    iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/cog-6-tooth.svg",
  },
  {
    name: "HeptaSense",
    title: "IoT & Sensing Systems",
    handle: "heptasense",
    status: "Online",
    role: "frontend" as RoleKey,
    avatarUrl:"https://heptapusgroup.com/uploads/1768587161613-heptasenseseffaf.png",
    contactText: "IoT",
    contactHref: "https://sense.heptapus.com",
    // Wifi / Signal ikonu
    iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/wifi.svg",
  },
  {
    name: "HeptaFlux",
    title: "Energy & Thermal Systems",
    handle: "heptaflux",
    status: "Stable",
    role: "design" as RoleKey,
    avatarUrl: "https://heptapusgroup.com/uploads/1768587373357-heptafluxseffaf.png",
    contactText: "Energy",
    contactHref: "https://flux.heptapus.com",
    // Bolt (Şimşek) ikonu
    iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/bolt.svg",
  },
  {
    name: "HeptaShield",
    title: "Security & Defense",
    handle: "heptashield",
    status: "Secured",
    role: "security" as RoleKey,
    avatarUrl: "https://heptapusgroup.com/uploads/1768587432121-heptashieldseffaf.png",
    contactText: "Defense",
    contactHref: "https://shield.heptapus.com",
    // Shield Check ikonu
    iconUrl: "https://raw.githubusercontent.com/heroicons/heroicons/master/optimized/24/outline/shield-check.svg",
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