import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, FileText, ArrowUpRight } from "lucide-react";
import { getPublishedMember } from "@/lib/team";
import { getServerLang } from "@/lib/get-server-lang";
import { teamCopy } from "@/lib/team-validation";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = await getPublishedMember((await params).slug);
  return member ? { title: `${member.name} | Heptapus Group`, description: member.summary || member.title } : { title: "Not found", robots: { index: false } };
}

export default async function MemberPage({ params }: Props) {
  const member = await getPublishedMember((await params).slug);
  if (!member) notFound();
  const t = teamCopy[await getServerLang()];

  return <article className="mx-auto w-[92%] max-w-[1120px] py-12 md:py-20">
    <Link className="division-text-link" href="/team"><ArrowLeft size={16} />{t.back}</Link>
    <header className={`person-profile-header ${member.photoUrl ? "person-profile-with-photo" : ""}`}>
      <div><p className="division-eyebrow">{member.title}</p><h1>{member.name}</h1>{member.summary && <p className="division-lead">{member.summary}</p>}
        <div className="division-actions">{member.resumeUrl && <a href={member.resumeUrl} target="_blank" rel="noopener noreferrer" className="group-primary-button"><FileText size={16} />{t.resume}</a>}{member.linkedinUrl && <a className="division-text-link" href={member.linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn<ArrowUpRight size={16} /></a>}</div>
      </div>{member.photoUrl && <img src={member.photoUrl} alt={member.name} className="person-profile-photo" fetchPriority="high" />}
    </header>
    {member.biography && <section className="border-t border-border py-12 md:py-16"><p className="division-eyebrow mb-8">{t.biography}</p><div className="division-prose max-w-3xl"><ReactMarkdown>{member.biography}</ReactMarkdown></div></section>}
  </article>;
}
