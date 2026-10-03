import { readJsonBody } from "@/lib/request-security";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { faqUpdateSchema, inputJson } from "@/lib/corporate-validation";
import { prisma } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = faqUpdateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "SSS bilgileri geçersiz." }, { status: 400 });
  }

  const { id } = await params;
  const data = parsed.data;
  const { category, translations, ...fields } = data;
  try {
    const item = await prisma.faqItem.update({
      where: { id },
      data: {
        ...fields,
        ...(category !== undefined && { category: category || null }),
        ...(translations !== undefined && { translations: inputJson(translations) }),
      },
    });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "SSS kaydı bulunamadı." }, { status: 404 });
    }
    console.error("FAQ update error", error);
    return NextResponse.json({ error: "SSS kaydı güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.faqItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "SSS kaydı bulunamadı." }, { status: 404 });
    }
    console.error("FAQ delete error", error);
    return NextResponse.json({ error: "SSS kaydı silinemedi." }, { status: 500 });
  }
}
