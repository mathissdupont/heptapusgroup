import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Member = { id: string; name: string; title: string; slug: string; summary: string; photoUrl: string | null };

export default function TeamGrid({ items, profileLabel }: { items: Member[]; profileLabel: string }) {
  return <div className="people-grid">{items.map(member => <article key={member.id} className="person-card">
    <Link href={`/team/${member.slug}`} tabIndex={-1} aria-hidden="true" className="person-portrait">
      {member.photoUrl ? <img src={member.photoUrl} alt="" loading="lazy" /> : <span>{member.name.split(/\s+/).map(part => part[0]).slice(0, 2).join("")}</span>}
      <ArrowUpRight className="person-portrait-arrow" size={20} />
    </Link>
    <p className="division-eyebrow mt-6">{member.title}</p>
    <h3><Link href={`/team/${member.slug}`}>{member.name}</Link></h3>
    {member.summary && <p className="person-summary">{member.summary}</p>}
    <Link href={`/team/${member.slug}`} className="division-text-link mt-5" aria-label={`${member.name} — ${profileLabel}`}>{profileLabel}<ArrowUpRight size={16} /></Link>
  </article>)}</div>;
}
