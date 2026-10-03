import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { BlogStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { blogData, blogSchema } from "@/lib/blog-validation";

type Context = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const { slug } = await params;
  try {
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return NextResponse.json({ error: "Blog yazısı bulunamadı." }, { status: 404 });

    const isPublic = post.status === BlogStatus.PUBLISHED
      && Boolean(post.publishedAt && post.publishedAt <= new Date());
    if (!isPublic && !await requireElevated(req)) {
      return NextResponse.json({ error: "Blog yazısı bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ item: post });
  } catch (error) {
    console.error("Blog fetch error", error);
    return NextResponse.json({ error: "Blog yazısı yüklenemedi." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = blogSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Blog bilgileri geçersiz." }, { status: 400 });
  }

  const { slug } = await params;
  try {
    const existing = await prisma.blogPost.findUnique({ where: { slug }, select: { publishedAt: true } });
    if (!existing) return NextResponse.json({ error: "Blog yazısı bulunamadı." }, { status: 404 });

    const data = blogData(parsed.data);
    if (parsed.data.status === BlogStatus.PUBLISHED && existing.publishedAt) {
      data.publishedAt = existing.publishedAt;
    }
    const post = await prisma.blogPost.update({ where: { slug }, data });
    return NextResponse.json({ ok: true, item: post });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Bu blog adresi zaten kullanılıyor." }, { status: 409 });
    }
    console.error("Blog update error", error);
    return NextResponse.json({ error: "Blog yazısı güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { slug } = await params;
  try {
    await prisma.blogPost.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Blog yazısı bulunamadı." }, { status: 404 });
    }
    console.error("Blog delete error", error);
    return NextResponse.json({ error: "Blog yazısı silinemedi." }, { status: 500 });
  }
}
