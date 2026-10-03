import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { projectData, projectSchema } from "@/lib/project-validation";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = projectSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Proje bilgileri geçersiz." }, { status: 400 });
  }

  const { id } = await params;
  try {
    await prisma.project.update({ where: { id }, data: projectData(parsed.data) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
      if (error.code === "P2002") return NextResponse.json({ error: "Bu proje adresi zaten kullanılıyor." }, { status: 409 });
    }
    console.error("Project update error", error);
    return NextResponse.json({ error: "Proje güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
    }
    console.error("Project delete error", error);
    return NextResponse.json({ error: "Proje silinemedi." }, { status: 500 });
  }
}
