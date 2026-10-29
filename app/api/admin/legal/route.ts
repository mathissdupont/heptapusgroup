import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { getLegalSettings } from "@/lib/legal";
import { LEGAL_SETTINGS_KEY, legalSettingsSchema } from "@/lib/legal-settings";
import { readJsonBody } from "@/lib/request-security";
import { databaseServiceError } from "@/lib/database-service-error";
export async function GET(req: NextRequest) {
  if (!await requireRole(["ADMIN"], req)) return NextResponse.json({ error: "Yönetici yetkisi gerekli." }, { status: 403 });
  try { return NextResponse.json({ settings: await getLegalSettings() }, { headers: { "Cache-Control": "no-store" } }); } catch (error) { return databaseServiceError(error); }
}
export async function POST(req: NextRequest) {
  if (!await requireRole(["ADMIN"], req)) return NextResponse.json({ error: "Yönetici yetkisi gerekli." }, { status: 403 });
  const parsed = legalSettingsSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Geçersiz bilgi." }, { status: 400 });
  try {
    const value = JSON.stringify(parsed.data);
    await prisma.setting.upsert({ where: { key: LEGAL_SETTINGS_KEY }, create: { key: LEGAL_SETTINGS_KEY, value }, update: { value } });
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return databaseServiceError(error); }
}
