import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { NEWSLETTER_CONSENT_VERSION } from "@/lib/privacy-versions";

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  consent: z.literal(true),
  consentVersion: z.literal(NEWSLETTER_CONSENT_VERSION),
  turnstileToken: z.string().max(2048).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "public:newsletter", { limit: 5, windowMs: 30 * 60 * 1000 });
  if (limited) return limited;

  const parsed = newsletterSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });

  const valid = await verifyTurnstile(parsed.data.turnstileToken, getClientIp(req));
  if (!valid) return NextResponse.json({ error: "Robot doğrulaması başarısız." }, { status: 403 });

  try {
    await prisma.subscriber.upsert({
      where: { email: parsed.data.email },
      update: { isActive: true, consentAt: new Date(), consentVersion: NEWSLETTER_CONSENT_VERSION },
      create: { email: parsed.data.email, consentAt: new Date(), consentVersion: NEWSLETTER_CONSENT_VERSION },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscription error", error);
    return NextResponse.json({ error: "Abonelik işlemi tamamlanamadı." }, { status: 500 });
  }
}
