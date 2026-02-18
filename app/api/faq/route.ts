import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";

export async function GET() {
  try {
    const items = await prisma.faqItem.findMany({
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
    if (!body?.question || !body?.answer) {
      return NextResponse.json({ error: "question and answer required" }, { status: 400 });
    }
    const created = await prisma.faqItem.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category ?? null,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
        translations: body.translations ?? null,
      },
    });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}
