import { open, realpath } from "node:fs/promises";
import { basename, resolve, sep } from "node:path";
import { Readable } from "node:stream";

export function parseByteRange(header: string | null, size: number) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size === 0) return false;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] ? (match[2] ? Math.min(Number(match[2]), size - 1) : size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) return false;
  return { start, end };
}

/** Stream files with range support; resolve symlinks before checking containment. */
export async function uploadedFileResponse(req: Request, root: string, parts: string[], contentType: string) {
  if (!parts.length || parts.some((part) => !part || part === "." || part === ".." || /[/\\\u0000:]/.test(part))) {
    return new Response("Bad Request", { status: 400 });
  }
  const normalizedRoot = await realpath(root);
  const target = await realpath(resolve(normalizedRoot, ...parts));
  if (!target.startsWith(`${normalizedRoot}${sep}`)) return new Response("Bad Request", { status: 400 });
  const file = await open(target, "r");
  let streamOwnsFile = false;
  try {
    const info = await file.stat();
    if (!info.isFile()) return new Response("Not Found", { status: 404 });
    const range = req.method === "HEAD" ? null : parseByteRange(req.headers.get("range"), info.size);
    if (range === false) return new Response(null, {
      status: 416, headers: { "Content-Range": `bytes */${info.size}`, "Accept-Ranges": "bytes" },
    });
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${basename(target).replace(/[^\x20-\x7e]|["\\]/g, "_")}"`,
      "Content-Length": String(range ? range.end - range.start + 1 : info.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-site",
      ...(contentType === "application/pdf" ? { "Content-Security-Policy": "sandbox" } : {}),
      ...(range ? { "Content-Range": `bytes ${range.start}-${range.end}/${info.size}` } : {}),
    };
    if (req.method === "HEAD") return new Response(null, { headers });
    const body = Readable.toWeb(file.createReadStream(range || {})) as ReadableStream<Uint8Array>;
    streamOwnsFile = true;
    return new Response(body, { status: range ? 206 : 200, headers });
  } finally { if (!streamOwnsFile) await file.close(); }
}
