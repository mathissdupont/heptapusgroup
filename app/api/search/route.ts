import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const query = `%${q}%`;

    // Search across projects, blog posts, FAQ items
    const [projects, blogPosts, faqItems] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { summary: { contains: q } },
          ],
        },
        select: { title: true, slug: true, summary: true },
        take: 5,
      }),
      prisma.blogPost.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        select: { title: true, slug: true, excerpt: true },
        take: 5,
      }),
      prisma.faqItem.findMany({
        where: {
          isActive: true,
          OR: [
            { question: { contains: q } },
            { answer: { contains: q } },
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
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "failed" }, { status: 500 });
  }
}
