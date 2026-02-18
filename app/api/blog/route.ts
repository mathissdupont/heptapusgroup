import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 12)));
    const tag = searchParams.get("tag");
    const status = searchParams.get("status");

    // Public: only PUBLISHED, Admin: all statuses
    const where: any = {};
    if (status === "all") {
      // admin mode — no filter
    } else {
      where.status = "PUBLISHED";
      where.publishedAt = { lte: new Date() };
    }
    if (tag) {
      // SQLite JSON filtering workaround
      where.tags = { string_contains: tag };
    }

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, limit });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body?.title || !body?.slug || !body?.content) {
      return NextResponse.json({ error: "title, slug and content required" }, { status: 400 });
    }
    const created = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt ?? null,
        content: body.content,
        coverImage: body.coverImage ?? null,
        author: body.author ?? null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        translations: body.translations ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}
