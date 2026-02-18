import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify Turnstile
    const valid = await verifyTurnstile(body?.turnstileToken);
    if (!valid) {
      return NextResponse.json({ error: "Robot verification failed" }, { status: 403 });
    }

    if (!body?.email || !body.email.includes("@")) {
      return NextResponse.json({ error: "valid email required" }, { status: 400 });
    }

    // Upsert to avoid duplicate errors
    await prisma.subscriber.upsert({
      where: { email: body.email.toLowerCase().trim() },
      update: { isActive: true },
      create: { email: body.email.toLowerCase().trim() },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}
