import { NextRequest, NextResponse } from "next/server";
import { getAboutContent } from "@/lib/about";
import { isValidLocale } from "@/lib/get-dictionary";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get("lang") || "tr";
  if (!isValidLocale(locale)) return NextResponse.json({ error: "Geçersiz dil." }, { status: 400 });
  try {
    const content = (await getAboutContent())[locale];
    return NextResponse.json({ content }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "İçerik yüklenemedi." }, { status: 503 });
  }
}
