import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";

export async function GET(req: NextRequest) {
  // If called from admin (with auth cookie), return ALL jobs; otherwise only active
  let showAll = false;
  try {
    const user = await requireElevated(req);
    if (user) showAll = true;
  } catch { /* not admin, show only active */ }

  try {
    const items = await prisma.jobPosting.findMany({
      ...(showAll ? {} : { where: { isActive: true } }),
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body?.title || !body?.slug || !body?.description) {
      return NextResponse.json({ error: "title, slug and description required" }, { status: 400 });
    }
    const created = await prisma.jobPosting.create({
      data: {
        title: body.title,
        slug: body.slug,
        department: body.department ?? null,
        location: body.location ?? null,
        type: body.type ?? "FULL_TIME",
        description: body.description,
        requirements: body.requirements ?? null,
        isActive: body.isActive ?? true,
        translations: body.translations ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}
