// app/team/page.tsx
import type { Metadata } from "next";
import TeamGrid from "./TeamGrid";
import { RoleKey } from "@/lib/roleThemes";

export const metadata: Metadata = { title: "Team | Heptapus" };

const team = [
  { name: "Samet Ünsal",   title: "Full-Stack / DevOps",              handle: "sametunsal",   status: "Online",  role: "backend"    as RoleKey, avatarUrl: "/avatars/samet.png",   contactText: "GitHub",iconUrl:"/icons/code.svg"},
  { name: "Ceren Tolunay", title: "Frontend / UX",                    handle: "cerentolunay", status: "Online",  role: "frontend"   as RoleKey, avatarUrl: "/avatars/ceren.jpg",   contactText: "LinkedIn",iconUrl:"/icons/code.svg" },
  { name: "Fatmanur Bulut",title: "QA / Test Otomasyon",              handle: "fatmanur",     status: "Busy",    role: "qa"         as RoleKey, avatarUrl: "/avatars/fatmanur.jpeg",contactText: "LinkedIn",iconUrl:"/icons/code.svg" },
  { name: "Halil Abacı",   title: "Backend / API",                    handle: "halilabaci",   status: "Online",  role: "backend"    as RoleKey, avatarUrl: "/avatars/halil.jpg",   contactText: "GitHub",iconUrl:"/icons/code.svg" }, 
  { name: "Hilal Ay",      title: "Mobil / React Native",             handle: "hilalay",      status: "Offline", role: "software"   as RoleKey, avatarUrl: "/avatars/hilal.jpg",   contactText: "LinkedIn",iconUrl:"/icons/code.svg"  },
  { name: "Özgür Dağlı",   title: "Siber Güvenlik / Automation",      handle: "ozgurdagli",   status: "Online",  role: "security"   as RoleKey, avatarUrl: "/avatars/ozgur.jpg",   contactText: "GitHub",iconUrl:"/icons/code.svg" },
  { name: "Gökalp Aysoy",  title: "Makine (Mechatronics) • ML",       handle: "gokalpaysoy",  status: "Online",  role: "mechanical" as RoleKey, avatarUrl: "/avatars/gokalp.jpg",  contactText: "LinkedIn",iconUrl:"/icons/cog.svg"  },
];

export default function TeamPage() {
  return (
    <section style={{ maxWidth: 1120, width: "92%", margin: "0 auto", padding: "56px 0" }}>
      <h1 style={{ marginTop: 0,textAlign:"center" }}>Ekip</h1>
      <p style={{ color: "#9fb0c3", marginBottom: 16, textAlign: "center" }}>
        7 kişilik çekirdek kadro. Üretimde kalite, karar almada hız.
      </p>
      <TeamGrid team={team} />
    </section>
  );
}
