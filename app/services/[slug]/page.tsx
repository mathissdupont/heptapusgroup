import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/DivisionLink";
import ReactMarkdown from "react-markdown";
import SubdomainLayout from "@/components/SubdomainLayout";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import { getDivisionCopy, hasServicePage, parseSubdomainSettings } from "@/lib/subdomain-content";
import { divisionMetadata, divisionPageData, serializeJsonLd, serviceEntity } from "@/lib/division-seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
async function getService(slug: string) {
  const name = await getSubdomain();
  const division = name ? await getSubdomainConfig(name) : null;
  const settings = parseSubdomainSettings(division?.settings);
  const index = settings.features?.findIndex(service => service.slug === slug && hasServicePage(service)) ?? -1;
  if (!division || index < 0) return null;
  return { division, settings, index, service: settings.features![index] };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getService(slug);
  return data ? divisionMetadata(data.division, `/services/${slug}`, { title: data.service.title, description: data.service.desc, image: data.service.imageUrl }) : { title: "Not found", robots: { index: false, follow: false } };
}
export default async function ServiceDetail({ params }: Props) {
  const { slug } = await params;
  const data = await getService(slug);
  if (!data) notFound();
  const { division, service, settings, index } = data;
  const t = getDivisionCopy(settings);
  return <SubdomainLayout subdomain={division}><article className="division-container division-project-detail">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(divisionPageData(division, `/services/${slug}`, service.title, [serviceEntity(division, service, index)])) }} />
    <nav aria-label={t.services}><Link className="division-text-link" href="/">{division.title}</Link><span aria-hidden="true"> / </span><Link className="division-text-link" href="/services">{t.services}</Link></nav>
    <header><p className="division-eyebrow">{division.title} / {t.services}</p><h1>{service.title}</h1><p className="division-lead">{service.desc}</p></header>
    {service.imageUrl && <img className="division-detail-image" src={service.imageUrl} alt={service.title} fetchPriority="high" />}
    <div className="division-prose division-detail-prose"><ReactMarkdown>{service.content || ""}</ReactMarkdown></div>
    <div className="division-actions pb-16"><Link className="division-button" href="/contact">{t.talk}</Link><Link className="division-text-link" href="/projects">{t.explore}</Link></div>
  </article></SubdomainLayout>;
}
