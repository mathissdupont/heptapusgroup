import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ ok: false, error: "Eksik alanlar var" }, { status: 400 });
    }

    const saved = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    return NextResponse.json({ ok: true, id: saved.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const items = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, items });
}
