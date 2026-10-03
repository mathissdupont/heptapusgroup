import { readJsonBody } from "@/lib/request-security";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { inputJson, jobUpdateSchema } from "@/lib/corporate-validation";
import { prisma } from "@/lib/db";

type Context = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const { slug } = await params;
  try {
    const user = await requireElevated(req);
    const job = await prisma.jobPosting.findUnique({
      where: { slug },
      ...(user ? { include: { _count: { select: { applications: true } } } } : {}),
    });
    if (!job || (!job.isActive && !user)) {
      return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    }
    return NextResponse.json({ item: job });
  } catch (error) {
    console.error("Career detail error", error);
    return NextResponse.json({ error: "İlan yüklenemedi." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = jobUpdateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "İlan bilgileri geçersiz." }, { status: 400 });
  }

  const { slug } = await params;
  const data = parsed.data;
  const { department, location, requirements, translations, ...fields } = data;
  try {
    const updated = await prisma.jobPosting.update({
      where: { slug },
      data: {
        ...fields,
        ...(department !== undefined && { department: department || null }),
        ...(location !== undefined && { location: location || null }),
        ...(requirements !== undefined && { requirements: requirements || null }),
        ...(translations !== undefined && { translations: inputJson(translations) }),
      },
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
      if (error.code === "P2002") return NextResponse.json({ error: "Bu ilan adresi zaten kullanılıyor." }, { status: 409 });
    }
    console.error("Career update error", error);
    return NextResponse.json({ error: "İlan güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { slug } = await params;
  try {
    await prisma.jobPosting.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    }
    console.error("Career delete error", error);
    return NextResponse.json({ error: "İlan silinemedi." }, { status: 500 });
  }
}
