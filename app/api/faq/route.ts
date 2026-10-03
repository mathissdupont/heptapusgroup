import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { faqCreateSchema, inputJson } from "@/lib/corporate-validation";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.faqItem.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("FAQ list error", error);
    return NextResponse.json({ error: "Sık sorulan sorular yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = faqCreateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "SSS bilgileri geçersiz." }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const created = await prisma.faqItem.create({
      data: { ...data, category: data.category || null, translations: inputJson(data.translations) },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("FAQ create error", error);
    return NextResponse.json({ error: "SSS kaydı oluşturulamadı." }, { status: 500 });
  }
}
