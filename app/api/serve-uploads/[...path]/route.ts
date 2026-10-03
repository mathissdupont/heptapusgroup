import { NextRequest, NextResponse } from "next/server";
import { resolve } from "node:path";
import { uploadedFileResponse } from "@/lib/upload-response";
import { uploadsDirectory } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
  pdf: "application/pdf",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const extension = parts.at(-1)?.split(".").pop()?.toLowerCase() || "";
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) return new NextResponse("Unsupported Media Type", { status: 415 });

  const roots = [
    uploadsDirectory(),
    resolve(process.cwd(), "public", "uploads"),
  ];

  for (const root of roots) {
    try {
      return await uploadedFileResponse(req, root, parts, contentType);
    } catch {
      // Diğer yükleme kökünü dene.
    }
  }

  return new NextResponse("Not Found", { status: 404 });
}

export const HEAD = GET;
