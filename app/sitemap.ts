import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import { parseSubdomainSettings } from "@/lib/subdomain-content";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const name = await getSubdomain();
  if (name) {
    const config = await getSubdomainConfig(name);
    if (!config) return [];
    const base = `https://${name}.heptapusgroup.com`;
    return [
      ...["", "/about", "/services", "/projects", "/contact"].map(path => ({ url: `${base}${path}`, lastModified: config.updatedAt })),
      ...(parseSubdomainSettings(config.settings).projects || []).filter(project => project.published).map(project => ({ url: `${base}/projects/${project.slug}`, lastModified: config.updatedAt })),
    ];
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
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
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
  return [...staticRoutes, ...projectRoutes, ...blogRoutes, ...teamRoutes];
}
