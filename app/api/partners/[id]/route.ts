import { readJsonBody } from "@/lib/request-security";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { partnerUpdateSchema } from "@/lib/corporate-validation";
import { prisma } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = partnerUpdateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Partner bilgileri geçersiz." }, { status: 400 });
  }

  const { id } = await params;
  const data = parsed.data;
  try {
    const item = await prisma.partner.update({
      where: { id },
      data: { ...data, ...(data.website !== undefined && { website: data.website || null }) },
    });
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Partner bulunamadı." }, { status: 404 });
    }
    console.error("Partner update error", error);
    return NextResponse.json({ error: "Partner güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.partner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Partner bulunamadı." }, { status: 404 });
    }
    console.error("Partner delete error", error);
    return NextResponse.json({ error: "Partner silinemedi." }, { status: 500 });
  }
}
