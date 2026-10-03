import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { announcementCreateSchema, inputJson } from "@/lib/corporate-validation";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  try {
    const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Announcement list error", error);
    return NextResponse.json({ error: "Duyurular yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = announcementCreateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Duyuru bilgileri geçersiz." }, { status: 400 });
  }

  const data = parsed.data;
  try {
    const created = await prisma.announcement.create({
      data: {
        message: data.message,
        linkUrl: data.linkUrl || null,
        linkText: data.linkText || null,
        bgColor: data.bgColor,
        isActive: data.isActive,
        startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        translations: inputJson(data.translations),
      },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (error) {
    console.error("Announcement create error", error);
    return NextResponse.json({ error: "Duyuru oluşturulamadı." }, { status: 500 });
  }
}
