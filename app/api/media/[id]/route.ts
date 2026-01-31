// app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { join } from "path";
import { unlink } from "fs/promises";


export const runtime = "nodejs";

type Ctx = { params: { id: string } };

export async function DELETE(req: NextRequest, ctx: any) {
  const params = ctx?.params || {};
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const item = await prisma.media.delete({ where: { id: params.id } }).catch(() => null);
    if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

    // public/uploads içindeki dosyayı da sil (best-effort)
    if (item.url?.startsWith("/uploads/")) {
      const abs = join(process.cwd(), "public", item.url);
      await unlink(abs).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "failed" }, { status: 500 });
  }
}
