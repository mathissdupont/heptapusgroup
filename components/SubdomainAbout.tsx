import ReactMarkdown from "react-markdown";
import { type Division, parseSubdomainSettings, getDivisionCopy } from "@/lib/subdomain-content";
import { DivisionContact } from "@/components/DivisionContent";

export default function SubdomainAbout({ subdomain }: { subdomain: Division }) {
  const settings = parseSubdomainSettings(subdomain.settings);
  const t = getDivisionCopy(settings);
  return (
    <div className="division-container">
      <section className="division-section">
        <div className="division-section-heading">
          <div><p className="division-eyebrow">{t.about}</p><h1>{subdomain.title}</h1></div>
          <span className="text-xs text-muted-foreground">{t.group}</span>
        </div>
        {subdomain.description && <p className="division-lead mb-10">{subdomain.description}</p>}
        {settings.aboutText && <div className="division-prose max-w-3xl"><ReactMarkdown>{settings.aboutText}</ReactMarkdown></div>}
      </section>
      <DivisionContact subdomain={subdomain} settings={settings} />
    </div>
  );
}
