import { NextRequest, NextResponse } from "next/server";
import { createWriteStream } from "fs";
import { mkdir, stat } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/db";
// import { isAdmin } from "@/lib/admin"; // istersen tekrar aç

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file missing" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());

  const uploadsDir = join(process.cwd(), "public", "uploads");
  try { await stat(uploadsDir); } catch { await mkdir(uploadsDir, { recursive: true }); }

  const safe = `${Date.now()}-${file.name.replace(/[^\w\-.]+/g, "_")}`;
  const filepath = join(uploadsDir, safe);

  await new Promise<void>((res, rej) => {
    const ws = createWriteStream(filepath);
    ws.on("finish", res);
    ws.on("error", rej);
    ws.end(bytes);
  });

  const url = `/uploads/${safe}`;

  // ⬇️ Şemadaki alan adlarıyla birebir uyuşuyor (filename YOK, name VAR!)
  const media = await prisma.media.create({
    data: {
      url,
      name: file.name,
      mime: file.type || "application/octet-stream",
      size: bytes.length,
      // width, height istersen burada hesaplayıp ekleyebilirsin
    },
  });

  return NextResponse.json({ ok: true, ...media }, { status: 201 });
}
