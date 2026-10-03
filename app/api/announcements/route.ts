import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const announcement = await prisma.announcement.findFirst({
      where: {
        isActive: true,
        startsAt: { lte: now },
        OR: [
          { endsAt: null },
          { endsAt: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ item: announcement });
  } catch (error) {
    console.error("Public announcement error", error);
    return NextResponse.json({ error: "Duyuru yüklenemedi." }, { status: 500 });
  }
}
