const MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Reject browser mutations from other origins, including sibling subdomains. */
export function isTrustedMutation(req: Request) {
  if (!MUTATIONS.has(req.method.toUpperCase())) return true;
  const site = req.headers.get("sec-fetch-site");
  if (site === "cross-site" || site === "same-site") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true; // CLI clients do not send browser cookies automatically.
  try {
    const source = new URL(origin);
    const targetHost = req.headers.get("host") || new URL(req.url).host;
    if (source.host !== targetHost || !["http:", "https:"].includes(source.protocol)) return false;
    const configuredOrigin = process.env.APP_ORIGIN;
    if (configuredOrigin && new URL(configuredOrigin).host === targetHost) {
      return source.origin === new URL(configuredOrigin).origin;
    }
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(source.hostname)
      || source.hostname.endsWith(".localhost");
    return process.env.NODE_ENV !== "production" || local || source.protocol === "https:";
  } catch {
    return false;
  }
}

export class RequestBodyError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

/** Count actual stream bytes; Content-Length can be missing or dishonest. */
export async function readBoundedBody(req: Request, maxBytes: number) {
  const declared = req.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) {
    throw new RequestBodyError("İstek boyutu izin verilen sınırı aşıyor.", 413);
  }
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new RequestBodyError("İstek boyutu izin verilen sınırı aşıyor.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export async function readJsonBody(req: Request): Promise<unknown> {
  const maxBytes = new URL(req.url).pathname.startsWith("/api/auth/") ? 16 * 1024 : 1024 * 1024;
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(await readBoundedBody(req, maxBytes)));
}

export async function readUploadForm(req: Request) {
  const bytes = await readBoundedBody(req, 55 * 1024 * 1024);
  return new Request(req.url, { method: "POST", headers: req.headers, body: bytes }).formData();
}
