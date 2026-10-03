import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, Status } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { projectData, projectSchema } from "@/lib/project-validation";

export async function GET(req: NextRequest) {
  try {
    const user = await requireElevated(req);
    const items = await prisma.project.findMany({
      where: user ? {} : { status: Status.LIVE },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items, total: items.length });
  } catch (error) {
    console.error("Project list error", error);
    return NextResponse.json({ error: "Projeler yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = projectSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Proje bilgileri geçersiz." }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({ data: projectData(parsed.data) });
    return NextResponse.json({ ok: true, id: project.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Bu proje adresi zaten kullanılıyor." }, { status: 409 });
    }
    console.error("Project create error", error);
    return NextResponse.json({ error: "Proje oluşturulamadı." }, { status: 500 });
  }
}
