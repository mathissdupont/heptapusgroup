import Link from "@/components/DivisionLink";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { type Division, parseSubdomainSettings, getDivisionCopy, orderedSections } from "@/lib/subdomain-content";
import { DivisionProjects, DivisionServices, DivisionContact } from "@/components/DivisionContent";

export default function SubdomainHome({ subdomain }: { subdomain: Division }) {
  const settings = parseSubdomainSettings(subdomain.settings);
  const t = getDivisionCopy(settings);
  const hasProjects = settings.projects?.some(project => project.published);
  return (
    <div className="division-container">
      <section className={`division-hero ${settings.heroImage ? "division-hero-with-image" : ""}`}>
        <div className="division-hero-copy">
          <p className="division-eyebrow"><span />{settings.tagline || t.group}</p>
          <h1>{settings.heroTitle || subdomain.title}</h1>
          {subdomain.description && <p className="division-lead">{subdomain.description}</p>}
          <div className="division-actions">
            <Link className="division-button" href={settings.heroButtonUrl || "/contact"}>{settings.heroButtonText || t.talk}<ArrowUpRight size={18} /></Link>
            <Link className="division-text-link" href={hasProjects ? "#projects" : "/services"}>{hasProjects ? t.explore : t.services}<ArrowRight size={18} /></Link>
          </div>
        </div>
        {settings.heroImage ? (
          <figure className="division-hero-image"><img src={settings.heroImage} alt={subdomain.title} fetchPriority="high" /><figcaption>{subdomain.title} / Heptapus Group</figcaption></figure>
        ) : (
          <div className="division-brand-plate" aria-hidden="true">
            {subdomain.logoUrl ? <img src={subdomain.logoUrl} alt="" /> : <span className="division-monogram">{subdomain.title.replace(/^Hepta/i, "").slice(0, 2)}</span>}
            <span className="division-plate-label">{subdomain.name.toUpperCase()} / HEPTAPUS GROUP</span>
          </div>
        )}
      </section>
      <div className="division-colophon"><span>{t.group}</span><span>{subdomain.name}.heptapusgroup.com</span></div>
      {orderedSections(settings).filter(key => !settings.hiddenSections?.includes(key)).map(key => {
        if (key === "about" && settings.aboutText) return <section key={key} id="about" className="division-section division-about"><p className="division-eyebrow">{t.about}</p><div className="division-prose"><ReactMarkdown>{settings.aboutText}</ReactMarkdown></div></section>;
        if (key === "services" && settings.features?.length) return <DivisionServices key={key} settings={settings} compact />;
        if (key === "projects" && hasProjects) return <DivisionProjects key={key} settings={settings} compact />;
        if (key === "custom" && (settings.customTitle || settings.customText)) return <section key={key} className="division-section division-about"><h2>{settings.customTitle}</h2><div className="division-prose"><ReactMarkdown>{settings.customText || ""}</ReactMarkdown></div></section>;
        if (key === "contact") return <DivisionContact key={key} subdomain={subdomain} settings={settings} />;
        return null;
      })}
    </div>
  );
}
