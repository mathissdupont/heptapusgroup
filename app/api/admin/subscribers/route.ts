import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const user = await requireRole(["ADMIN"], req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  try {
    const items = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("Subscriber list error", error);
    return NextResponse.json({ error: "Aboneler yüklenemedi." }, { status: 500 });
  }
}
