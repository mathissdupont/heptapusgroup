import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const job = await prisma.jobPosting.findUnique({
      where: { slug },
      include: { _count: { select: { applications: true } } },
    });
    if (!job) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ item: job });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { slug } = await params;
    const body = await req.json();
    const updated = await prisma.jobPosting.update({
      where: { slug },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.department !== undefined && { department: body.department }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.requirements !== undefined && { requirements: body.requirements }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.translations !== undefined && { translations: body.translations }),
      },
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const { slug } = await params;
    await prisma.jobPosting.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}
