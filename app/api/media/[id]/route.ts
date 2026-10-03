import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { removeStoredUpload } from "@/lib/uploads";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { id } = await params;
  try {
    const item = await prisma.media.delete({ where: { id } }).catch(() => null);
    if (!item) return NextResponse.json({ error: "Medya bulunamadı." }, { status: 404 });

    await removeStoredUpload(item.url);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Media delete error", error);
    return NextResponse.json({ error: "Medya silinemedi." }, { status: 500 });
  }
}
