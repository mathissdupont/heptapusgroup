import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

function contentTypeFromExt(p: string) {
  const ext = (p.split(".").pop() || "").toLowerCase();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    case "gif": return "image/gif";
    case "svg": return "image/svg+xml";
    case "mp4": return "video/mp4";
    case "pdf": return "application/pdf";
    default: return "application/octet-stream";
  }
}

export async function GET(_req: NextRequest, ctx: any) {
  const parts = (ctx?.params?.path as string[]) || [];
  if (!parts.length) return new NextResponse("Not Found", { status: 404 });

  const rel = parts.join("/");
  // güvenlik: path traversal engelle
  if (rel.includes("..")) return new NextResponse("Bad Request", { status: 400 });

  const abs = join(process.cwd(), "public", "uploads", rel);

  try {
    const buf = await readFile(abs);
    const uint8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    const blob = new Blob([uint8 as any]);
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFromExt(rel),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
