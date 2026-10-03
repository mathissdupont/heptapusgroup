import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000),
  turnstileToken: z.string().max(2048).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "public:contact", { limit: 5, windowMs: 30 * 60 * 1000 });
  if (limited) return limited;

  const parsed = contactSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Form bilgileri geçersiz." }, { status: 400 });
  }

  const valid = await verifyTurnstile(parsed.data.turnstileToken, getClientIp(req));
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Robot doğrulaması başarısız." }, { status: 403 });
  }

  try {
    const saved = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });
    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (error) {
    console.error("Contact form error", error);
    return NextResponse.json({ ok: false, error: "Mesaj gönderilemedi." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Bu endpoint kullanıma kapalıdır." }, { status: 405 });
}
