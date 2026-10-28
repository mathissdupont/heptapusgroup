import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { type Division, type SubdomainSettings, getDivisionCopy } from "@/lib/subdomain-content";

export function DivisionServices({ settings, compact = false }: { settings: SubdomainSettings; compact?: boolean }) {
  const t = getDivisionCopy(settings);
  const services = settings.features || [];
  const Heading = compact ? "h2" : "h1";
  return <section id="services" className="division-section">
    <div className="division-section-heading"><div><p className="division-eyebrow">{t.services}</p><Heading>{settings.servicesTitle || t.expertise}</Heading></div>{compact && <Link className="division-text-link" href="/services">{t.services}<ArrowUpRight size={18} /></Link>}</div>
    <div className="division-services-list">{services.map((service, index) => <article key={index} id={`service-${index + 1}`} className="division-service">
      <span className="division-index">{String(index + 1).padStart(2, "0")}</span>
      <h3>{service.title}</h3><div><p>{service.desc}</p>{service.url && <a className="division-text-link" href={service.url}>{service.title}<ArrowUpRight size={16} /></a>}</div>
      {!compact && service.imageUrl && <img className="division-service-image" src={service.imageUrl} alt={service.title} loading="lazy" />}
    </article>)}</div>
  </section>;
}

export function DivisionProjects({ settings, compact = false }: { settings: SubdomainSettings; compact?: boolean }) {
  const t = getDivisionCopy(settings);
  const projects = (settings.projects || []).filter(project => project.published);
  const visible = compact ? projects.slice(0, 4) : projects;
  const Heading = compact ? "h2" : "h1";
  return <section id="projects" className="division-section">
    <div className="division-section-heading"><div><p className="division-eyebrow">{t.projects}</p><Heading>{settings.projectsTitle || t.work}</Heading></div>{compact && <Link className="division-text-link" href="/projects">{t.all}<ArrowUpRight size={18} /></Link>}</div>
    {visible.length ? <div className="division-project-grid">{visible.map((project, index) => <Link key={project.slug} href={`/projects/${project.slug}`} className="division-project group">
      <div className="division-project-image">{project.imageUrl ? <img src={project.imageUrl} alt={project.title} loading="lazy" /> : <span className="division-project-type" aria-hidden="true">{project.title}</span>}<span className="division-project-number">{String(index + 1).padStart(2, "0")}</span><span className="division-project-arrow"><ArrowUpRight size={22} /></span></div>
      {project.category && <p className="division-eyebrow mt-5">{project.category}</p>}
      <h3>{project.title}</h3><p className="division-project-summary">{project.summary}</p>
    </Link>)}</div> : <p className="py-12 text-muted-foreground border-y border-border">{t.empty}</p>}
  </section>;
}

export function DivisionContact({ subdomain, settings }: { subdomain: Division; settings: SubdomainSettings }) {
  const t = getDivisionCopy(settings);
  return <section id="contact" className="division-contact division-section"><p className="division-eyebrow">{t.contact}</p><h2>{settings.contactTitle || t.contactTitle}</h2><p>{settings.contactText || t.contactText}</p><div className="division-actions"><Link className="division-button" href="/contact">{t.talk}<ArrowRight size={18} /></Link>{settings.contactEmail && <a className="division-text-link break-all" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>}</div><span className="division-contact-signature">{subdomain.title}</span></section>;
}
