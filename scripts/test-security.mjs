import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { Module, createRequire } from "node:module";
import { join, resolve, basename } from "node:path";
import { tmpdir } from "node:os";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";
import { NextRequest } from "next/server.js";
import { SignJWT } from "jose";
import { RotatingLog } from "./rotating-log.mjs";
import { finished } from "node:stream/promises";

// Run checked-in migrations against an isolated PostgreSQL engine, never .env/DATABASE_URL.
const db = new PGlite();
const temp = await mkdtemp(join(tmpdir(), "hepta-security-"));
process.env.AUTH_SECRET = "test-only-secret-with-at-least-32-characters";
process.env.NODE_ENV = "production";
process.env.UPLOAD_DIR = temp;
process.env.APP_ORIGIN = "https://heptapusgroup.com";
delete process.env.TRUSTED_PROXY_IP_HEADER;
const root = resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);

function query(parts, values) {
  return { text: parts.reduce((sql, part, index) => sql + (index ? `$${index}` : "") + part, ""), values };
}
const prisma = {
  async $queryRaw(parts, ...values) {
    const sql = query(parts, values);
    return (await db.query(sql.text, sql.values)).rows;
  },
  async $executeRaw(parts, ...values) {
    const sql = query(parts, values);
    return (await db.query(sql.text, sql.values)).affectedRows;
  },
  user: {
    async findUnique({ where }) {
      return (await db.query('SELECT * FROM "User" WHERE "id" = $1', [where.id])).rows[0] || null;
    },
    async updateMany({ where }) {
      const result = await db.query('UPDATE "User" SET "sessionVersion" = "sessionVersion" + 1 WHERE "id" = $1 AND "email" = $2 AND "sessionVersion" = $3', [where.id, where.email, where.sessionVersion]);
      return { count: result.affectedRows };
    },
  },
};

// Load the actual TS modules, substituting only the database transport.
function loader() {
  const cache = new Map();
  function load(path) {
    const file = resolve(root, path);
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = new Module(file);
    loadedModule.filename = file;
    loadedModule.paths = Module._nodeModulePaths(root);
    cache.set(file, loadedModule);
    loadedModule.require = (name) => name === "@/lib/db" ? { prisma }
      : name.startsWith("@/") ? load(name.slice(2) + ".ts") : require(name);
    const output = ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
      fileName: file,
    });
    loadedModule._compile(output.outputText, file);
    return loadedModule.exports;
  }
  return load;
}

let passed = 0;
async function check(name, fn) { await fn(); passed++; console.log(`PASS ${name}`); }
const request = (path, init = {}) => new NextRequest(`https://heptapusgroup.com${path}`, init);

try {
  await check("PostgreSQL baseline and incremental migrations", async () => {
    const migrations = (await readdir(join(root, "prisma/migrations"), { withFileTypes: true }))
      .filter((item) => item.isDirectory()).map((item) => item.name).sort();
    for (const migration of migrations) {
      await db.exec(readFileSync(join(root, "prisma/migrations", migration, "migration.sql"), "utf8"));
      if (migration === "0_init") await db.query('INSERT INTO "User" ("id", "email", "passwordHash", "role", "updatedAt") VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)', ["admin-1", "admin@example.com", "test", "ADMIN"]);
    }
    assert.equal((await prisma.user.findUnique({ where: { id: "admin-1" } })).sessionVersion, 0);
  });
  const load = loader();
  const security = load("lib/request-security.ts");
  const auth = load("lib/auth.ts");
  const admin = load("lib/admin.ts");
  const limiterA = load("lib/rate-limit.ts");
  const limiterB = loader()("lib/rate-limit.ts");
  const claims = { id: "admin-1", email: "admin@example.com", role: "ADMIN", sessionVersion: 0 };
  const token = await auth.createToken(claims);
  const authenticated = (path, init = {}) => request(path, { ...init, headers: { cookie: `hepta_auth=${token}`, ...init.headers } });

  await check("IP addresses and lookalike hosts are not subdomains", () => {
    const { subdomainFromHost } = load("lib/hostname.ts");
    for (const host of ["127.0.0.1:3000", "[::1]:3000", "localhost:3000", "www.heptapusgroup.com", "flux.heptapusgroup.com.evil.example"]) assert.equal(subdomainFromHost(host), null);
    assert.equal(subdomainFromHost("flux.localhost:3000"), "flux");
    assert.equal(subdomainFromHost("flux.heptapusgroup.com"), "flux");
  });

  await check("cross-origin and sibling-domain mutations are rejected", () => {
    for (const headers of [{ origin: "https://evil.example" }, { origin: "https://flux.heptapusgroup.com" }, { "sec-fetch-site": "same-site" }, { origin: "null" }, { origin: "http://heptapusgroup.com" }]) {
      assert.equal(security.isTrustedMutation(request("/api/admin/users", { method: "POST", headers })), false);
    }
    assert.equal(security.isTrustedMutation(request("/api/contact", { method: "POST", headers: { origin: "https://heptapusgroup.com", "sec-fetch-site": "same-origin" } })), true);
  });
  await check("byte limits work without Content-Length and with a forged length", async () => {
    for (const headers of [{}, { "content-length": "1" }]) {
      await assert.rejects(security.readBoundedBody(request("/api/upload", { method: "POST", headers, body: "123456" }), 5), (error) => error.status === 413);
    }
    assert.deepEqual(await security.readJsonBody(request("/api/contact", { method: "POST", body: '{"a":1}' })), { a: 1 });
  });
  await check("forged, expired and incomplete JWTs are rejected", async () => {
    assert.equal((await auth.parseToken(token)).id, claims.id);
    await assert.rejects(auth.parseToken(token.slice(0, -8) + "INVALID!"));
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const expired = await new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setIssuer("heptapusgroup").setAudience("heptapus-admin").setExpirationTime("0s").sign(secret);
    await assert.rejects(auth.parseToken(expired));
    const incomplete = await new SignJWT({ id: claims.id }).setProtectedHeader({ alg: "HS256" }).setIssuer("heptapusgroup").setAudience("heptapus-admin").setExpirationTime("1h").sign(secret);
    await assert.rejects(auth.parseToken(incomplete));
  });
  await check("authorization checks current role, user and session version", async () => {
    assert.equal((await admin.requireElevated(authenticated("/api/media"))).id, claims.id);
    assert.equal(await admin.requireElevated(request("/api/media")), null);
    assert.equal(await admin.requireElevated(authenticated("/api/media", { headers: { host: "flux.heptapusgroup.com" } })), null);
    assert.equal(await admin.requireElevated(authenticated("/api/media", { method: "POST", headers: { origin: "https://evil.example" } })), null);
    await db.query('UPDATE "User" SET "role" = $1 WHERE "id" = $2', ["VIEWER", claims.id]);
    assert.equal(await admin.requireElevated(authenticated("/api/media")), null);
    await db.query('UPDATE "User" SET "role" = $1 WHERE "id" = $2', ["ADMIN", claims.id]);
  });
  await check("logout revokes copied tokens and repeated logout is idempotent", async () => {
    const logout = load("app/api/auth/logout/route.ts");
    assert.equal((await logout.POST(authenticated("/api/auth/logout", { method: "POST" }))).status, 200);
    assert.equal(await admin.requireElevated(authenticated("/api/media")), null);
    await logout.POST(authenticated("/api/auth/logout", { method: "POST" }));
    assert.equal((await prisma.user.findUnique({ where: { id: claims.id } })).sessionVersion, 1);
  });
  await check("proxy headers cannot change identities unless explicitly trusted", () => {
    const req = request("/api/auth/login", { headers: { "cf-connecting-ip": "192.0.2.1", "x-real-ip": "192.0.2.2" } });
    assert.equal(limiterA.getClientIp(req), "unknown");
    process.env.TRUSTED_PROXY_IP_HEADER = "x-real-ip";
    assert.equal(limiterA.getClientIp(req), "192.0.2.2");
    delete process.env.TRUSTED_PROXY_IP_HEADER;
  });
  await check("atomic rate limit survives multiple workers and concurrent requests", async () => {
    const responses = await Promise.all(Array.from({ length: 20 }, (_, index) =>
      (index % 2 ? limiterA : limiterB).rateLimit(request("/api/auth/login"), "test:shared", { limit: 5, windowMs: 60_000 })));
    assert.equal(responses.filter((response) => response === null).length, 5);
    assert.equal(responses.filter((response) => response?.status === 429).length, 15);
    assert.ok(responses.find(Boolean).headers.get("retry-after"));
    assert.equal((await loader()("lib/rate-limit.ts").rateLimit(request("/api/auth/login"), "test:shared", { limit: 5, windowMs: 60_000 })).status, 429);
  });
  await check("account limits cannot be bypassed by changing IP", async () => {
    process.env.TRUSTED_PROXY_IP_HEADER = "x-real-ip";
    for (let index = 1; index <= 3; index++) {
      const response = await limiterA.rateLimit(request("/api/auth/login", { headers: { "x-real-ip": `192.0.2.${index}` } }), "test:account", { limit: 2, windowMs: 60_000, identity: "user@example.com" });
      assert.equal(response?.status ?? 200, index === 3 ? 429 : 200);
    }
    delete process.env.TRUSTED_PROXY_IP_HEADER;
    await db.exec('UPDATE "RateLimitBucket" SET "resetAt" = CURRENT_TIMESTAMP - INTERVAL \'1 second\'');
    assert.equal(await limiterA.rateLimit(request("/api/auth/login"), "test:shared", { limit: 5, windowMs: 60_000 }), null);
  });
  await check("HTML sanitization removes executable markup but preserves text", () => {
    const html = load("lib/sanitize-html.ts").sanitizeRichHtml('<p>Hello</p><script>alert(1)</script><img src="x" onerror="alert(2)"><a href="javascript:alert(3)">link</a>');
    assert.ok(html.includes("<p>Hello</p>"));
    assert.ok(!/script|onerror|javascript:/i.test(html));
  });
  await check("new passwords respect bcrypt's Unicode byte limit", () => {
    const { newPasswordSchema } = load("lib/password-validation.ts");
    assert.equal(newPasswordSchema.safeParse("a".repeat(72)).success, true);
    assert.equal(newPasswordSchema.safeParse("a".repeat(73)).success, false);
    assert.equal(newPasswordSchema.safeParse("🔒".repeat(19)).success, false);
  });
  await check("unsafe URL forms are rejected", () => {
    const { isSafeUrl } = load("lib/safe-url.ts");
    for (const url of ["//evil.example", "/\\evil.example", "javascript:alert(1)", "https://user:pass@example.com", "/a\nb"]) assert.equal(isSafeUrl(url), false);
    for (const url of ["/projects/demo", "https://example.com/a"]) assert.equal(isSafeUrl(url), true);
  });
  await check("uploads reject type spoofing and cannot delete outside storage", async () => {
    const uploads = load("lib/uploads.ts");
    await assert.rejects(uploads.storeUpload(new File(["<script>evil</script>"], "fake.png", { type: "image/png" }), ["image"]), (error) => error.status === 415);
    const file = new File([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "../test.png", { type: "image/png" });
    const stored = await uploads.storeUpload(file, ["image"]);
    assert.equal(basename(stored.absolutePath), stored.url.split("/").at(-1));
    assert.deepEqual(await readFile(stored.absolutePath), Buffer.from(await file.arrayBuffer()));
    await uploads.removeStoredUpload("/uploads/../..");
    assert.ok((await readdir(temp)).includes(basename(stored.absolutePath)));
  });
  await check("file responses support seeking, HEAD and reject traversal", async () => {
    const { uploadedFileResponse } = load("lib/upload-response.ts");
    await writeFile(join(temp, "video.mp4"), "0123456789");
    const partial = await uploadedFileResponse(request("/uploads/video.mp4", { headers: { range: "bytes=2-4" } }), temp, ["video.mp4"], "video/mp4");
    assert.equal(partial.status, 206); assert.equal(await partial.text(), "234");
    assert.equal(partial.headers.get("content-range"), "bytes 2-4/10");
    const invalid = await uploadedFileResponse(request("/uploads/video.mp4", { headers: { range: "bytes=50-60" } }), temp, ["video.mp4"], "video/mp4");
    assert.equal(invalid.status, 416);
    const head = await uploadedFileResponse(request("/uploads/video.mp4", { method: "HEAD" }), temp, ["video.mp4"], "video/mp4");
    assert.equal(head.headers.get("content-length"), "10"); assert.equal(await head.text(), "");
    assert.equal((await uploadedFileResponse(request("/uploads/video.mp4"), temp, ["..", "video.mp4"], "video/mp4")).status, 400);
    // Windows can require privileges for symlinks; test when the host permits them.
    const outside = join(temp, "..", `${basename(temp)}-outside.mp4`);
    await writeFile(outside, "private");
    try {
      await symlink(outside, join(temp, "linked.mp4"));
      assert.equal((await uploadedFileResponse(request("/uploads/linked.mp4"), temp, ["linked.mp4"], "video/mp4")).status, 400);
    } catch (error) { if (!["EPERM", "EACCES"].includes(error.code)) throw error; }
    finally { await rm(outside, { force: true }); }
  });
  await check("log rotation retains a bounded number of files", async () => {
    const path = join(temp, "app.log");
    const log = new RotatingLog(path, 10, 2);
    for (let index = 0; index < 5; index++) log.write(Buffer.alloc(8, String(index)));
    log.end(); await finished(log);
    assert.equal((await readFile(path)).toString(), "44444444");
    assert.equal((await readFile(path + ".1")).toString(), "33333333");
    assert.equal((await readFile(path + ".2")).toString(), "22222222");
    await assert.rejects(readFile(path + ".3"), (error) => error.code === "ENOENT");
  });
  await check("rate limits fail closed when storage is unavailable", async () => {
    const transport = prisma.$queryRaw;
    prisma.$queryRaw = async () => { throw new Error("offline"); };
    try { assert.equal((await limiterA.rateLimit(request("/api/auth/login"), "test:offline", { limit: 5, windowMs: 60_000 })).status, 503); }
    finally { prisma.$queryRaw = transport; }
  });
  await check("SQLite import refuses populated targets and rolls back partial imports", async () => {
    const { copyData } = require("./migrate-sqlite-to-pg.js");
    const pg = { query: (text, values) => db.query(text, values) };
    const sqlite = (data) => ({ prepare: (sql) => ({ all: () => data[/FROM "([^"]+)"/.exec(sql)[1]] || [] }) });
    await assert.rejects(copyData(sqlite({}), pg), /not empty/);
    assert.equal((await prisma.user.findUnique({ where: { id: claims.id } })).email, claims.email);
    await db.exec('DELETE FROM "User"');
    const row = { id: "import-1", email: "import@example.com", name: null, passwordHash: "hash", role: "ADMIN", createdAt: 0, updatedAt: 0 };
    await assert.rejects(copyData(sqlite({ User: [row, { ...row, id: "import-2" }] }), pg));
    assert.equal((await db.query('SELECT COUNT(*)::int AS count FROM "User"')).rows[0].count, 0);
    assert.equal(await copyData(sqlite({ User: [row], Project: [{ id: "project-1", title: "Test", slug: "test", summary: "Test", status: "LIVE", tags: '["one","two"]', content: null, translations: '{"en":{"title":"Test"}}', createdAt: 0, updatedAt: 0 }] }), pg), 2);
    assert.deepEqual((await db.query('SELECT "tags" FROM "Project"')).rows[0].tags, ["one", "two"]);
  });
  console.log(`\n${passed} security checks passed.`);
} finally { await db.close(); await rm(temp, { recursive: true, force: true }); }
