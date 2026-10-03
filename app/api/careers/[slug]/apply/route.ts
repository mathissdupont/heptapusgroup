import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(40).optional(),
  coverLetter: z.string().trim().max(10_000).optional(),
  turnstileToken: z.string().max(2048).nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limited = await rateLimit(req, "public:job-application", { limit: 5, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const parsed = applicationSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Başvuru bilgileri geçersiz." }, { status: 400 });

  const valid = await verifyTurnstile(parsed.data.turnstileToken, getClientIp(req));
  if (!valid) return NextResponse.json({ error: "Robot doğrulaması başarısız." }, { status: 403 });

  const { slug } = await params;
  try {
    const job = await prisma.jobPosting.findUnique({ where: { slug } });
    if (!job?.isActive) return NextResponse.json({ error: "İlan bulunamadı veya başvurular kapalı." }, { status: 404 });

    const application = await prisma.jobApplication.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        coverLetter: parsed.data.coverLetter || null,
        resumeUrl: null,
        jobId: job.id,
      },
    });
    return NextResponse.json({ ok: true, id: application.id }, { status: 201 });
  } catch (error) {
    console.error("Job application error", error);
    return NextResponse.json({ error: "Başvuru gönderilemedi." }, { status: 500 });
  }
}
