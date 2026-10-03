import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { partnerCreateSchema } from "@/lib/corporate-validation";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.partner.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Partner list error", error);
    return NextResponse.json({ error: "Partnerler yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = partnerCreateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Partner bilgileri geçersiz." }, { status: 400 });
  }

  try {
    const data = parsed.data;
    const created = await prisma.partner.create({ data: { ...data, website: data.website || null } });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Partner create error", error);
    return NextResponse.json({ error: "Partner oluşturulamadı." }, { status: 500 });
  }
}
