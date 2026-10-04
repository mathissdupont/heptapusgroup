import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/admin";
import { systemHealth } from "@/lib/health";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  if (!await requireRole(["ADMIN"], req)) return NextResponse.json({ error: "Yönetici yetkisi gerekli." }, { status: 403 });
  const health = await systemHealth();
  const healthy = health.database.ok && health.schemaOk && health.storage.writable;
  return NextResponse.json(health, { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
