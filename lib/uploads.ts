import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { basename, join, resolve, sep } from "node:path";

type UploadKind = "image" | "video" | "document";

type FileDefinition = {
  extension: string;
  kind: UploadKind;
  maxBytes: number;
  matches: (bytes: Buffer) => boolean;
};

const MB = 1024 * 1024;
const DEFINITIONS: Record<string, FileDefinition> = {
  "image/jpeg": {
    extension: "jpg", kind: "image", maxBytes: 10 * MB,
    matches: (bytes) => bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  "image/png": {
    extension: "png", kind: "image", maxBytes: 10 * MB,
    matches: (bytes) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  "image/gif": {
    extension: "gif", kind: "image", maxBytes: 10 * MB,
    matches: (bytes) => ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii")),
  },
  "image/webp": {
    extension: "webp", kind: "image", maxBytes: 10 * MB,
    matches: (bytes) => bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP",
  },
  "image/avif": {
    extension: "avif", kind: "image", maxBytes: 10 * MB,
    matches: (bytes) => bytes.subarray(4, 8).toString("ascii") === "ftyp" && /avi[fs]/.test(bytes.subarray(8, 32).toString("ascii")),
  },
  "video/mp4": {
    extension: "mp4", kind: "video", maxBytes: 50 * MB,
    matches: (bytes) => bytes.subarray(4, 8).toString("ascii") === "ftyp",
  },
  "video/webm": {
    extension: "webm", kind: "video", maxBytes: 50 * MB,
    matches: (bytes) => bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])),
  },
  "application/pdf": {
    extension: "pdf", kind: "document", maxBytes: 10 * MB,
    matches: (bytes) => bytes.subarray(0, 5).toString("ascii") === "%PDF-",
  },
};

export class UploadValidationError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function uploadsDirectory() {
  return process.env.UPLOAD_DIR || join(process.cwd(), "data", "uploads");
}

export async function storeUpload(file: File, allowedKinds: readonly UploadKind[]) {
  const definition = DEFINITIONS[file.type.toLowerCase()];
  if (!definition || !allowedKinds.includes(definition.kind)) {
    throw new UploadValidationError("Bu dosya türüne izin verilmiyor.", 415);
  }
  if (file.size <= 0 || file.size > definition.maxBytes) {
    throw new UploadValidationError(
      `Dosya boş veya izin verilen ${definition.maxBytes / MB} MB sınırını aşıyor.`,
      413,
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!definition.matches(bytes)) {
    throw new UploadValidationError("Dosya içeriği bildirilen türle eşleşmiyor.", 415);
  }

  const directory = uploadsDirectory();
  await mkdir(directory, { recursive: true });
  const storedName = `${Date.now()}-${randomUUID()}.${definition.extension}`;
  const absolutePath = join(directory, storedName);
  await writeFile(absolutePath, bytes, { flag: "wx", mode: 0o640 });

  return {
    absolutePath,
    url: `/uploads/${storedName}`,
    name: basename(file.name).slice(0, 255),
    mime: file.type.toLowerCase(),
    size: bytes.length,
  };
}

export async function removeStoredUpload(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const fileName = basename(url.slice("/uploads/".length));
  const root = resolve(uploadsDirectory());
  const target = resolve(root, fileName);
  if (!target.startsWith(`${root}${sep}`)) return;
  await unlink(target).catch(() => undefined);
}
