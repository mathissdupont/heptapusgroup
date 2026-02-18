import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";

export async function GET() {
  try {
    const items = await prisma.partner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
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
    if (!body?.name || !body?.logoUrl) {
      return NextResponse.json({ error: "name and logoUrl required" }, { status: 400 });
    }
    const created = await prisma.partner.create({
      data: {
        name: body.name,
        logoUrl: body.logoUrl,
        website: body.website ?? null,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}
