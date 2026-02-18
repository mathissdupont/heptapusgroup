import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, turnstileToken } = await req.json();

    // Verify Turnstile
    const valid = await verifyTurnstile(turnstileToken);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Robot doğrulaması başarısız" }, { status: 403 });
    }

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
