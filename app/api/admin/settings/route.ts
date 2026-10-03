import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/admin";

const ADMIN_ROLES = ["ADMIN"] as const;
const ALLOWED_KEYS = new Set([
  "siteTitle", "description", "twitter", "github", "linkedin", "heroVideoUrl",
  "stat_companies", "stat_projects", "stat_team", "stat_years",
  "logo_heptanet", "logo_heptaware", "logo_heptacore", "logo_heptadynamics",
  "logo_heptasense", "logo_heptaflux", "logo_heptashield",
]);
const settingsSchema = z.record(z.string(), z.string().max(2000));

export async function GET(req: NextRequest) {
  const user = await requireRole(ADMIN_ROLES, req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });

  const items = await prisma.setting.findMany({ where: { key: { in: [...ALLOWED_KEYS] } } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(ADMIN_ROLES, req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });

  const parsed = settingsSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ayar verileri geçersiz." }, { status: 400 });

  const entries = Object.entries(parsed.data);
  if (entries.some(([key]) => !ALLOWED_KEYS.has(key))) {
    return NextResponse.json({ error: "İzin verilmeyen bir ayar anahtarı gönderildi." }, { status: 400 });
  }

  await prisma.$transaction(entries.map(([key, value]) => prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  })));
  return NextResponse.json({ ok: true });
}
