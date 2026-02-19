// app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { join } from "path";
import { unlink } from "fs/promises";


export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function DELETE(req: NextRequest, ctx: any) {
  const params = ctx?.params || {};
  const user = await requireElevated();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const item = await prisma.media.delete({ where: { id: params.id } }).catch(() => null);
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

    // data/uploads içindeki dosyayı da sil (best-effort)
    if (item.url?.startsWith("/uploads/")) {
      const filename = item.url.replace("/uploads/", "");
      const abs = join(process.cwd(), "data", "uploads", filename);
      await unlink(abs).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "failed" }, { status: 500 });
  }
}
