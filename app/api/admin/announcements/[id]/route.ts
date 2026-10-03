import { readJsonBody } from "@/lib/request-security";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { announcementUpdateSchema, inputJson } from "@/lib/corporate-validation";
import { prisma } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = announcementUpdateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Duyuru bilgileri geçersiz." }, { status: 400 });
  }

  const { id } = await params;
  const data = parsed.data;
  const { linkUrl, linkText, startsAt, endsAt, translations, ...fields } = data;
  try {
    const item = await prisma.announcement.update({
      where: { id },
      data: {
        ...fields,
        ...(linkUrl !== undefined && { linkUrl: linkUrl || null }),
        ...(linkText !== undefined && { linkText: linkText || null }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : new Date() }),
        ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
        ...(translations !== undefined && { translations: inputJson(translations) }),
      },
    });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });
    }
    console.error("Announcement update error", error);
    return NextResponse.json({ error: "Duyuru güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Duyuru bulunamadı." }, { status: 404 });
    }
    console.error("Announcement delete error", error);
    return NextResponse.json({ error: "Duyuru silinemedi." }, { status: 500 });
  }
}
