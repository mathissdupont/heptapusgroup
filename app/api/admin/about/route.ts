import { NextRequest, NextResponse } from "next/server";
import { requireElevated } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { getAboutContent } from "@/lib/about";
import { aboutContentSchema, ABOUT_CONTENT_KEY } from "@/lib/about-content";
import { databaseServiceError } from "@/lib/database-service-error";
import { readJsonBody } from "@/lib/request-security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!await requireElevated(req)) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  try {
    return NextResponse.json({ content: await getAboutContent() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return databaseServiceError(error); }
}

export async function POST(req: NextRequest) {
  if (!await requireElevated(req)) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  const parsed = aboutContentSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const locale = String(issue?.path[0] || "");
    const labels: Record<string, string> = { stats: "Hakkımızda istatistikleri", homeStats: "Ana sayfa istatistikleri", timeline: "Yolculuğumuz", timelineTitle: "Yolculuğumuz başlığı" };
    const section = labels[String(issue?.path[1])] || "İçerik";
    const row = typeof issue?.path[2] === "number" ? `, ${issue.path[2] + 1}. satır` : "";
    return NextResponse.json({ error: `${locale.toUpperCase()} ${section}${row}: ${issue?.message || "Bilgileri kontrol edin."}`, locale }, { status: 400 });
  }
  try {
    const value = JSON.stringify(parsed.data);
    await prisma.setting.upsert({ where: { key: ABOUT_CONTENT_KEY }, create: { key: ABOUT_CONTENT_KEY, value }, update: { value } });
    return NextResponse.json({ ok: true, content: parsed.data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return databaseServiceError(error); }
}
