import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { removeStoredUpload, storeUpload, UploadValidationError } from "@/lib/uploads";
import { readUploadForm, RequestBodyError } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  try {
    const form = await readUploadForm(req);
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });
    }

    const stored = await storeUpload(file, ["image"]);
    try {
      const media = await prisma.media.create({
        data: {
          url: stored.url,
          name: stored.name,
          mime: stored.mime,
          size: stored.size,
        },
      });
      return NextResponse.json({ ok: true, ...media }, { status: 201 });
    } catch (error) {
      await removeStoredUpload(stored.url);
      throw error;
    }
  } catch (error) {
    if (error instanceof UploadValidationError || error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Upload error", error);
    return NextResponse.json({ error: "Dosya yüklenemedi." }, { status: 500 });
  }
}
