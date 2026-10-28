import { NextResponse } from "next/server";
import { getServiceCatalog } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ items: await getServiceCatalog() });
  } catch {
    return NextResponse.json({ error: "Hizmetler yüklenemedi." }, { status: 503 });
  }
}
