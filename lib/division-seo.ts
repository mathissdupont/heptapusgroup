import type { Metadata } from "next";
import { type Division, type DivisionService, getDivisionCopy, hasServicePage, parseSubdomainSettings, servicePath } from "@/lib/subdomain-content";

export function divisionOrigin(division: Division): string {
  return `https://${division.name}.heptapusgroup.com`;
}
export function divisionUrl(division: Division, path = "/"): string {
  return `${divisionOrigin(division)}${division.localePrefix || ""}${path === "/" ? "" : path}`;
}

export function plainDescription(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/[#*_`\[\]]/g, "").replace(/\s+/g, " ").trim().slice(0, 320);
}

type PageOptions = { title?: string; description?: string; image?: string };

export function divisionMetadata(division: Division, path = "/", options: PageOptions = {}): Metadata {
  const settings = parseSubdomainSettings(division.settings);
  const t = getDivisionCopy(settings);
  const base = divisionOrigin(division);
  const names: Record<string, string> = { "/about": t.about, "/services": settings.servicesTitle || t.services, "/projects": settings.projectsTitle || t.projects, "/contact": t.contact };
  const homeTitle = settings.seo?.title || `${division.title}${division.description ? ` | ${plainDescription(division.description).slice(0, 100)}` : ""}`;
  const title = path === "/" ? homeTitle : `${options.title || names[path] || division.title} | ${division.title}`;
  const serviceSummary = (settings.features || []).map(service => service.title).join(", ");
  const descriptions: Record<string, string | undefined> = {
    "/": settings.seo?.description || division.description || settings.tagline,
    "/about": settings.aboutText || division.description || undefined,
    "/services": serviceSummary || division.description || undefined,
    "/projects": (settings.projects || []).filter(project => project.published).map(project => project.title).join(", ") || division.description || undefined,
    "/contact": settings.contactText || division.description || undefined,
  };
  const description = plainDescription(options.description || descriptions[path] || division.description || division.title);
  const image = options.image || settings.seo?.image || settings.heroImage || division.logoUrl;
  const images = image ? [{ url: new URL(image, base).href, alt: division.title }] : undefined;
  const editions = division.languageVersions?.filter(version => version.paths.includes(path)) || [];
  const languages = editions.length > 1 ? Object.fromEntries(editions.map(version => [version.locale, `${base}${version.prefix}${path === "/" ? "" : path}`])) : undefined;
  const index = !(path === "/projects" && !settings.projects?.some(project => project.published)) && !(path === "/services" && !settings.features?.length);
  return {
    metadataBase: new URL(base),
    title: { absolute: title }, description,
    alternates: { canonical: divisionUrl(division, path), languages },
    openGraph: { title, description, url: divisionUrl(division, path), siteName: division.title, type: "website", locale: { tr: "tr_TR", en: "en_US", de: "de_DE" }[settings.locale || "en"], images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images: images?.map(item => item.url) },
    robots: { index, follow: true, googleBot: { index, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

/** Escape user-authored strings before embedding JSON in a script element. */
export function serializeJsonLd(value: unknown): string { return JSON.stringify(value).replace(/</g, "\\u003c"); }

export function divisionIdentity(division: Division) {
  const settings = parseSubdomainSettings(division.settings);
  const base = divisionOrigin(division);
  return {
    "@context": "https://schema.org", "@graph": [
      { "@type": "Organization", "@id": `${base}/#organization`, name: division.title, url: base,
        description: division.description || undefined, logo: division.logoUrl ? new URL(division.logoUrl, base).href : undefined,
        parentOrganization: { "@type": "Organization", name: "Heptapus Group", url: "https://heptapusgroup.com" },
        email: settings.contactEmail || undefined,
        sameAs: Object.values(settings.socialLinks || {}).filter((value): value is string => typeof value === "string" && /^https?:\/\//.test(value)),
      },
      { "@type": "WebSite", "@id": `${base}/#website`, name: division.title, url: base, inLanguage: settings.locale || "en", publisher: { "@id": `${base}/#organization` } },
    ],
  };
}

export function serviceEntity(division: Division, service: DivisionService, index: number) {
  const base = divisionOrigin(division);
  const url = divisionUrl(division, servicePath(service, index));
  return { "@type": "Service", "@id": hasServicePage(service) ? `${url}#service` : url, name: service.title, description: service.desc, url,
    provider: { "@id": `${base}/#organization` }, image: service.imageUrl ? new URL(service.imageUrl, base).href : undefined };
}

export function divisionPageData(division: Division, path: string, title: string, entities: object[] = []) {
  const base = divisionOrigin(division);
  const url = divisionUrl(division, path);
  const settings = parseSubdomainSettings(division.settings);
  const t = getDivisionCopy(settings);
  const crumbs = [{ name: division.title, item: divisionUrl(division) }];
  if (path.startsWith("/services/")) crumbs.push({ name: t.services, item: divisionUrl(division, "/services") });
  if (path.startsWith("/projects/")) crumbs.push({ name: t.projects, item: divisionUrl(division, "/projects") });
  if (path !== "/") crumbs.push({ name: title, item: url });
  return { "@context": "https://schema.org", "@graph": [
    { "@type": path === "/about" ? "AboutPage" : path === "/contact" ? "ContactPage" : "WebPage", "@id": `${url}#webpage`, url, name: title, inLanguage: settings.locale || "en", isPartOf: { "@id": `${base}/#website` }, about: { "@id": `${base}/#organization` }, ...(path !== "/" ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}), ...(entities.length ? { mainEntity: entities.map(entity => ({ "@id": (entity as { "@id": string })["@id"] })) } : {}) },
    ...(path === "/" ? [] : [{ "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: crumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })) }]),
    ...entities,
  ] };
}
