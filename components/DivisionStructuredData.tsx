import { type Division, getDivisionCopy, parseSubdomainSettings } from "@/lib/subdomain-content";
import { divisionPageData, serviceEntity, serializeJsonLd } from "@/lib/division-seo";

export default function DivisionStructuredData({ division, path }: { division: Division; path: string }) {
  const settings = parseSubdomainSettings(division.settings);
  const t = getDivisionCopy(settings);
  const title = ({ "/": settings.heroTitle || division.title, "/about": t.about, "/services": settings.servicesTitle || t.expertise, "/projects": settings.projectsTitle || t.work, "/contact": t.contact } as Record<string, string>)[path] || division.title;
  const services = path === "/services" || (path === "/" && !settings.hiddenSections?.includes("services")) ? settings.features || [] : [];
  const entities = services.map((service, index) => serviceEntity(division, service, index));
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(divisionPageData(division, path, title, entities)) }} />;
}
