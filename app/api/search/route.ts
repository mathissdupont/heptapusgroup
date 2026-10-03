import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "public:search", { limit: 60, windowMs: 60 * 1000 });
  if (limited) return limited;

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().slice(0, 100);
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Search across projects, blog posts, FAQ items
    const [projects, blogPosts, faqItems] = await Promise.all([
      prisma.project.findMany({
        where: {
          status: "LIVE",
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { title: true, slug: true, summary: true },
        take: 5,
      }),
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { lte: new Date() },
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { title: true, slug: true, excerpt: true },
        take: 5,
      }),
      prisma.faqItem.findMany({
        where: {
          isActive: true,
          OR: [
            { question: { contains: q, mode: "insensitive" } },
            { answer: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, question: true },
        take: 5,
      }),
    ]);

    const results = [
      ...projects.map((p) => ({ type: "project" as const, title: p.title, url: `/projects/${p.slug}`, desc: p.summary })),
      ...blogPosts.map((p) => ({ type: "blog" as const, title: p.title, url: `/blog/${p.slug}`, desc: p.excerpt })),
      ...faqItems.map((f) => ({ type: "faq" as const, title: f.question, url: `/faq#${f.id}`, desc: null })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error", error);
    return NextResponse.json({ error: "Arama tamamlanamadı." }, { status: 500 });
  }
}
