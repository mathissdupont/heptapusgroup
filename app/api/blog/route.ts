import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { BlogStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { blogData, blogSchema } from "@/lib/blog-validation";

function positiveInteger(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = positiveInteger(searchParams.get("page"), 1, 100_000);
  const limit = positiveInteger(searchParams.get("limit"), 12, 50);
  const tag = searchParams.get("tag")?.trim().slice(0, 50);
  const wantsAll = searchParams.get("status") === "all";
  const user = wantsAll ? await requireElevated(req) : null;

  if (wantsAll && !user) {
    return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const where: Prisma.BlogPostWhereInput = wantsAll
    ? {}
    : { status: BlogStatus.PUBLISHED, publishedAt: { lte: new Date() } };
  if (tag) where.tags = { array_contains: [tag] };

  try {
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
  } catch (error) {
    console.error("Blog list error", error);
    return NextResponse.json({ error: "Blog yazıları yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = blogSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Blog bilgileri geçersiz." }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.create({ data: blogData(parsed.data) });
    return NextResponse.json({ ok: true, id: post.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Bu blog adresi zaten kullanılıyor." }, { status: 409 });
    }
    console.error("Blog create error", error);
    return NextResponse.json({ error: "Blog yazısı oluşturulamadı." }, { status: 500 });
  }
}
