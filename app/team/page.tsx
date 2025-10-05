// app/team/page.tsx
import type { Metadata } from "next";
import TeamGrid from "./TeamGrid";
import { RoleKey } from "@/lib/roleThemes";

export const metadata: Metadata = { title: "Team | Heptapus" };

const team = [
  { name: "Samet Ünsal",   title: "Full-Stack",              handle: "sametunsal",   status: "Online",  role: "backend"    as RoleKey, avatarUrl: "/avatars/samet.png",   contactText: "LinkedIn",iconUrl:"/icons/code.svg"},
  { name: "Ceren Tolunay", title: "Siber Güvenlik / Automation",                    handle: "cerentolunay", status: "Online",  role: "frontend"   as RoleKey, avatarUrl: "/avatars/ceren.png",   contactText: "LinkedIn",iconUrl:"/icons/code.svg" },
  { name: "Fatmanur Bulut",title: "Frontend / UX",              handle: "fatmanur",     status: "Busy",    role: "qa"         as RoleKey, avatarUrl: "/avatars/fatmanur.png",contactText: "LinkedIn",iconUrl:"/icons/code.svg" },
  { name: "Halil Abacı",   title: "Bilgisayar Mühendisi(Computer Engineer)",                    handle: "halilabaci",   status: "Online",  role: "backend"    as RoleKey, avatarUrl: "/avatars/halil.png",   contactText: "LinkedIn",iconUrl:"/icons/code.svg" }, 
  { name: "Hilal Ay",      title: "QA / Test Otomasyon",             handle: "hilalay",      status: "Offline", role: "software"   as RoleKey, avatarUrl: "/avatars/hilal.png",   contactText: "LinkedIn",iconUrl:"/icons/code.svg"  },
  { name: "Özgür Dağlı",   title: "Bilgisayar Mühendisi(Computer Engineer)",      handle: "ozgurdagli",   status: "Online",  role: "security"   as RoleKey, avatarUrl: "/avatars/ozgur.png",   contactText: "LinkedIn",iconUrl:"/icons/code.svg" },
  { name: "Gökalp Aysoy",  title: "Makine Mühendisi (Mechanical Engineer)",       handle: "gokalpaysoy",  status: "Online",  role: "mechanical" as RoleKey, avatarUrl: "/avatars/gokalp.png",  contactText: "LinkedIn",iconUrl:"/icons/cog.svg"  },
];

export default function TeamPage() {
  return (
    <section style={{ maxWidth: 1120, width: "92%", margin: "0 auto", padding: "56px 0" }}>
      <h1 style={{ marginTop: 0,textAlign:"center" }}>Ekip</h1>
      <p style={{ color: "#9fb0c3", marginBottom: 16, textAlign: "center" }}>
        7 kişilik çekirdek kadro.
      </p>
      <TeamGrid team={team} />
    </section>
  );
}
