// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma, $Enums } from "@prisma/client";
import { requireElevated } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    // Misafirler sadece LIVE görsün; admin/editor hepsini görsün
    const where: Prisma.ProjectWhereInput = { };
    const items = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items, total: items.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body?.title || !body?.slug || !body?.summary) {
      return NextResponse.json(
        { error: "missing fields" },
        { status: 400 }
      );
    }

    const created = await prisma.project.create({
      data: {
        title: body.title,
        slug: body.slug,
        summary: body.summary,
        imageUrl: body.imageUrl ?? null,
        status:
          body.status && body.status in $Enums.Status
            ? (body.status as $Enums.Status)
            : $Enums.Status.DRAFT,
        tags: Array.isArray(body.tags) ? body.tags : [],
        content: typeof body.content === "string" ? body.content : null, 
      },
    });

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "server error" },
      { status: 500 }
    );
  }
}
