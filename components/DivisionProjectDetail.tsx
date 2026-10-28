import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { type Division, type DivisionProject, parseSubdomainSettings, getDivisionCopy } from "@/lib/subdomain-content";

export default function DivisionProjectDetail({ subdomain, project }: { subdomain: Division; project: DivisionProject }) {
  const t = getDivisionCopy(parseSubdomainSettings(subdomain.settings));
  return <article className="division-container division-project-detail">
    <Link className="division-text-link" href="/projects"><ArrowLeft size={16} />{t.back}</Link>
    <header><p className="division-eyebrow">{project.category || subdomain.title}</p><h1>{project.title}</h1><p className="division-lead">{project.summary}</p></header>
    {project.imageUrl && <img className="division-detail-image" src={project.imageUrl} alt={project.title} fetchPriority="high" />}
    {project.content && <div className="division-prose division-detail-prose"><ReactMarkdown>{project.content}</ReactMarkdown></div>}
    <div className="division-actions pb-16">{project.url && <a href={project.url} className="division-button">{t.visit}<ArrowUpRight size={18} /></a>}<Link href="/contact" className="division-text-link">{t.talk}<ArrowUpRight size={18} /></Link></div>
  </article>;
}
