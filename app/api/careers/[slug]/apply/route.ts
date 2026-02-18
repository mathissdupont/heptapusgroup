import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyTurnstile } from "@/lib/turnstile";

// Public endpoint — anyone can apply
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const job = await prisma.jobPosting.findUnique({ where: { slug } });
    if (!job || !job.isActive) {
      return NextResponse.json({ error: "job not found or closed" }, { status: 404 });
    }

    const body = await req.json();

    // Verify Turnstile
    const valid = await verifyTurnstile(body?.turnstileToken);
    if (!valid) {
      return NextResponse.json({ error: "Robot verification failed" }, { status: 403 });
    }

    if (!body?.name || !body?.email) {
      return NextResponse.json({ error: "name and email required" }, { status: 400 });
    }

    const application = await prisma.jobApplication.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        resumeUrl: body.resumeUrl ?? null,
        coverLetter: body.coverLetter ?? null,
        jobId: job.id,
      },
    });

    return NextResponse.json({ ok: true, id: application.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}
