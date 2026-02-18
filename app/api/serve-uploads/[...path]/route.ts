import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentTypeFromExt(p: string) {
  const ext = (p.split(".").pop() || "").toLowerCase();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    case "gif": return "image/gif";
    case "svg": return "image/svg+xml";
    case "ico": return "image/x-icon";
    case "avif": return "image/avif";
    case "mp4": return "video/mp4";
    case "webm": return "video/webm";
    case "pdf": return "application/pdf";
    default: return "application/octet-stream";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_req: NextRequest, ctx: any) {
  const params = await ctx.params;
  const parts: string[] = params?.path || [];
  if (!parts.length) return new NextResponse("Not Found", { status: 404 });

  const rel = parts.join("/");
  // güvenlik: path traversal engelle
  if (rel.includes("..")) return new NextResponse("Bad Request", { status: 400 });

  // Önce data/uploads'ta ara (yeni yüklenenler), sonra public/uploads'ta (git'teki eski dosyalar)
  const dataPath = join(process.cwd(), "data", "uploads", rel);
  const publicPath = join(process.cwd(), "public", "uploads", rel);

  for (const abs of [dataPath, publicPath]) {
    try {
      await access(abs);
      const buf = await readFile(abs);
      return new NextResponse(buf as unknown as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": contentTypeFromExt(rel),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // bu dizinde yok, diğerine bak
    }
  }

  return new NextResponse("Not Found", { status: 404 });
}
