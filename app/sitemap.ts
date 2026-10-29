import { divisionVariants, divisionPaths } from "@/lib/division-locales";
import { divisionUrl } from "@/lib/division-seo";
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import { parseSubdomainSettings } from "@/lib/subdomain-content";
import { getLegalSettings } from "@/lib/legal";
import { legalReviewComplete } from "@/lib/legal-settings";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const name = await getSubdomain();
  if (name) {
    const config = await getSubdomainConfig(name);
    if (!config) return [];
    const variants = divisionVariants(config);
    return variants.flatMap(variant => divisionPaths(parseSubdomainSettings(variant.settings)).map(path => ({
      url: divisionUrl(variant, path), lastModified: config.updatedAt,
      alternates: { languages: Object.fromEntries(variants.filter(other => divisionPaths(parseSubdomainSettings(other.settings)).includes(path)).map(other => [parseSubdomainSettings(other.settings).locale || "en", divisionUrl(other, path)])) },
    })));
  }
  const baseUrl = "https://heptapusgroup.com";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/team`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/careers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/sustainability`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic project routes
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = await prisma.project.findMany({
      where: { status: "LIVE" },
      select: { slug: true, updatedAt: true },
    });
    projectRoutes = projects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {}

  // Dynamic blog routes
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
    });
    if (posts) {
      blogRoutes = posts.map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch {}

  const members = await prisma.teamMember.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  const teamRoutes = members.map(member => ({ url: `${baseUrl}/team/${member.slug}`, lastModified: member.updatedAt }));
  let legalRoutes: MetadataRoute.Sitemap = [];
  try {
    if (legalReviewComplete(await getLegalSettings())) legalRoutes = ["privacy", "terms", "kvkk", "cookies", "consent"].flatMap(kind => ["tr", "en", "de"].map(lang => ({ url: `${baseUrl}/${kind}?lang=${lang}` })));
  } catch {}
  return [...staticRoutes, ...projectRoutes, ...blogRoutes, ...teamRoutes, ...legalRoutes];
}
