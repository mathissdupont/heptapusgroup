import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const items = await prisma.subdomain.findMany({
      where: { isActive: true }, orderBy: { name: "asc" },
      select: { id: true, name: true, title: true, description: true, logoUrl: true, themeColor: true },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Şirketler yüklenemedi." }, { status: 500 });
  }
}
