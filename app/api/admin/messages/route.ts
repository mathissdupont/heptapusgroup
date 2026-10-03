import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/admin";

const ADMIN_ROLES = ["ADMIN"] as const;
const updateSchema = z.object({ id: z.string().min(1).max(64), read: z.boolean() });

export async function GET(req: NextRequest) {
  const user = await requireRole(ADMIN_ROLES, req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });

  try {
    const items = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Message list error", error);
    return NextResponse.json({ error: "Mesajlar yüklenemedi." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await requireRole(ADMIN_ROLES, req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });

  const parsed = updateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz mesaj bilgisi." }, { status: 400 });

  try {
    await prisma.contactMessage.update({
      where: { id: parsed.data.id },
      data: { read: parsed.data.read },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });
  }
}
