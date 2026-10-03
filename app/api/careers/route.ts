import { readJsonBody } from "@/lib/request-security";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { inputJson, jobCreateSchema } from "@/lib/corporate-validation";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireElevated(req);
    const items = await prisma.jobPosting.findMany({
      where: user ? {} : { isActive: true },
      orderBy: { createdAt: "desc" },
      ...(user ? { include: { _count: { select: { applications: true } } } } : {}),
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Career list error", error);
    return NextResponse.json({ error: "İş ilanları yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = jobCreateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "İlan bilgileri geçersiz." }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const created = await prisma.jobPosting.create({
      data: {
        title: data.title,
        slug: data.slug,
        department: data.department || null,
        location: data.location || null,
        type: data.type,
        description: data.description,
        requirements: data.requirements || null,
        isActive: data.isActive,
        translations: inputJson(data.translations),
      },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Bu ilan adresi zaten kullanılıyor." }, { status: 409 });
    }
    console.error("Career create error", error);
    return NextResponse.json({ error: "İlan oluşturulamadı." }, { status: 500 });
  }
}
