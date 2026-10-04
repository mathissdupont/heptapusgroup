import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/admin";
import { AUDIT_ACTIONS } from "@/lib/audit";

export const dynamic = "force-dynamic";
const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  action: z.enum(Object.keys(AUDIT_ACTIONS) as [keyof typeof AUDIT_ACTIONS, ...Array<keyof typeof AUDIT_ACTIONS>]).optional(),
});

export async function GET(req: NextRequest) {
  if (!await requireRole(["ADMIN"], req)) {
    return NextResponse.json({ error: "Yönetici yetkisi gerekli." }, { status: 403 });
  }
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz filtre." }, { status: 400 });
  const { page, action } = parsed.data;
  const where = action ? { action } : {};
  try {
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 25, take: 25 }),
      prisma.auditLog.count({ where }),
    ]);
    return NextResponse.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / 25)) });
  } catch (error) {
    console.error("Audit read error", error);
    return NextResponse.json({ error: "İşlem geçmişi okunamadı. Veritabanı ve migration durumunu kontrol edin." }, { status: 503 });
  }
}
