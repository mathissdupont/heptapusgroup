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
import { testTransport } from "./test-prisma-transport.mjs";

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

let failAudit = false;
const prisma = testTransport(db, { beforeAudit: () => { if (failAudit) throw new Error("audit unavailable"); } });

// Load the actual TS modules, substituting only the database transport.
function loader(overrides = {}) {
  const cache = new Map();
  function load(path) {
    const file = resolve(root, path);
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = new Module(file);
    loadedModule.filename = file;
    loadedModule.paths = Module._nodeModulePaths(root);
    cache.set(file, loadedModule);
    loadedModule.require = (name) => name in overrides ? overrides[name] : name === "@/lib/db" ? { prisma }
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

  await check("team profiles require permission, preserve partial updates and hide unpublished biographies", async () => {
    const routes = load("app/api/admin/team/route.ts");
    const detail = load("app/api/admin/team/[id]/route.ts");
    const published = load("lib/team.ts");
    const schema = load("lib/team-validation.ts").teamMemberSchema;
    const input = { name: "Test Board Member", slug: "test-board-member", title: "Board Member", biography: "Private biography", photoUrl: "/uploads/portrait.png", resumeUrl: "/uploads/cv.pdf" };
    assert.equal((await routes.GET(request("/api/admin/team"))).status, 403);
    assert.equal((await routes.POST(request("/api/admin/team", { method: "POST", body: JSON.stringify(input) }))).status, 403);
    assert.equal(schema.safeParse({ ...input, resumeUrl: "javascript:alert(1)" }).success, false);
    assert.equal(schema.safeParse({ ...input, linkedinUrl: "https://linkedin.com.evil.example/person" }).success, false);
    const created = await routes.POST(authenticated("/api/admin/team", { method: "POST", body: JSON.stringify(input) }));
    assert.equal(created.status, 201);
    const { item } = await created.json();
    assert.equal(item.isActive, false);
    assert.equal((await published.getPublishedTeam()).length, 0);
    assert.equal(await published.getPublishedMember(item.slug), null);
    const context = { params: Promise.resolve({ id: item.id }) };
    assert.equal((await detail.PUT(request(`/api/admin/team/${item.id}`, { method: "PUT", body: JSON.stringify({ isActive: true }) }), context)).status, 403);
    const updated = await detail.PUT(authenticated(`/api/admin/team/${item.id}`, { method: "PUT", body: JSON.stringify({ isActive: true }) }), context);
    assert.equal(updated.status, 200);
    const saved = (await updated.json()).item;
    assert.equal(saved.name, input.name); assert.equal(saved.biography, input.biography); assert.equal(saved.group, "BOARD");
    const list = await published.getPublishedTeam();
    assert.equal(list[0].slug, item.slug); assert.ok(!("biography" in list[0]));
    assert.equal((await published.getPublishedMember(item.slug)).biography, input.biography);
    assert.equal((await routes.POST(authenticated("/api/admin/team", { method: "POST", body: JSON.stringify(input) }))).status, 409);
    assert.equal((await detail.DELETE(authenticated(`/api/admin/team/${item.id}`, { method: "DELETE" }), context)).status, 200);
    assert.equal((await published.getPublishedTeam()).length, 0);
  });

  await check("CV upload accepts PDF only in its explicit authenticated upload flow", async () => {
    const upload = load("app/api/upload/route.ts");
    const makeBody = (purpose) => { const body = new FormData(); body.append("file", new File(["%PDF-1.7\n%%EOF"], "test-cv.pdf", { type: "application/pdf" })); if (purpose) body.append("purpose", purpose); return body; };
    assert.equal((await upload.POST(request("/api/upload", { method: "POST", body: makeBody("team-resume") }))).status, 403);
    assert.equal((await upload.POST(authenticated("/api/upload", { method: "POST", body: makeBody() }))).status, 415);
    const response = await upload.POST(authenticated("/api/upload", { method: "POST", body: makeBody("team-resume") }));
    assert.equal(response.status, 201);
    const media = await response.json();
    assert.equal(media.mime, "application/pdf");
    assert.ok(media.url.endsWith(".pdf"));
    await load("lib/uploads.ts").removeStoredUpload(media.url);
    await prisma.media.delete({ where: { id: media.id } });
  });

  await check("login confirms session storage and reports rejected cookies and service errors", async () => {
    const { loginAndVerify } = load("lib/login-client.ts");
    const session = { user: { id: "test", email: "test@example.com", role: "EDITOR" } };
    const sequence = (responses) => async (url, init) => {
      assert.equal(init.credentials, "include"); assert.equal(init.cache, "no-store");
      const [status, body] = responses.shift();
      return new Response(JSON.stringify(body), { status });
    };
    assert.deepEqual(await loginAndVerify("test@example.com", "password", sequence([[200, { ok: true }], [200, session]])), session);
    await assert.rejects(loginAndVerify("different@example.com", "password", sequence([[200, { ok: true }], [200, session]])), /eşleşmedi/);
    await assert.rejects(loginAndVerify("a@b.com", "x", sequence([[401, { error: "Wrong password" }]])), /Wrong password/);
    await assert.rejects(loginAndVerify("a@b.com", "x", sequence([[200, { ok: true }], [200, { user: null }]])), /çerezi/);
    await assert.rejects(loginAndVerify("a@b.com", "x", sequence([[200, { ok: true }], [503, { error: "Database unavailable" }]])), /Database unavailable/);
    await assert.rejects(loginAndVerify("a@b.com", "x", sequence([[200, { ok: true }], [200, { user: { id: "test", role: "VIEWER" } }]])), /yetkisi/);
    await assert.rejects(loginAndVerify("a@b.com", "x", sequence([[200, { unexpected: true }]])), /tamamlanamadı/);
  });

  await check("login handles legacy email casing, inactive accounts, missing schema and temporary session outages", async () => {
    const login = load("app/api/auth/login/route.ts");
    const email = "Legacy.Case@Example.com";
    const password = "test-login-password-123";
    const passwordHash = await load("lib/hash.ts").hash(password);
    const member = await prisma.user.create({ data: { email, passwordHash, role: "EDITOR" } });
    const attempt = (value = password) => login.POST(request("/api/auth/login", { method: "POST", body: JSON.stringify({ email: email.toLowerCase(), password: value }) }));
    const response = await attempt(); assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const cookie = response.cookies.get("hepta_auth"); assert.ok(cookie?.httpOnly); assert.ok(cookie?.secure);
    const claims = await auth.parseToken(cookie.value); assert.equal(claims.id, member.id);
    const headers = { cookies: async () => ({ get: () => ({ value: cookie.value }) }) };
    const me = loader({ "next/headers": headers })("app/api/auth/me/route.ts");
    const current = await me.GET(); assert.equal((await current.json()).user.id, member.id); assert.equal(current.headers.get("cache-control"), "no-store");
    const unavailable = loader({ "next/headers": headers, "@/lib/db": { prisma: { user: { findUnique: async () => { throw new Error("Temporary outage"); } } } } })("app/api/auth/me/route.ts");
    const outage = await unavailable.GET(); assert.equal(outage.status, 503); assert.equal(outage.headers.get("set-cookie"), null);
    assert.equal((await attempt("wrong-password")).status, 401);
    await prisma.user.update({ where: { id: member.id }, data: { isActive: false } });
    assert.equal((await attempt()).status, 401);
    await prisma.user.update({ where: { id: member.id }, data: { isActive: true, role: "VIEWER" } });
    assert.equal((await attempt()).status, 403);
    const duplicate = await prisma.user.create({ data: { email: email.toLowerCase(), passwordHash, role: "EDITOR" } });
    assert.equal((await attempt()).status, 401);
    await db.exec('ALTER TABLE "RateLimitBucket" RENAME TO "RateLimitBucket_test_backup"');
    try {
      const missingSchema = await attempt(); assert.equal(missingSchema.status, 503);
      assert.equal((await missingSchema.json()).code, "DATABASE_SCHEMA_OUTDATED");
    } finally { await db.exec('ALTER TABLE "RateLimitBucket_test_backup" RENAME TO "RateLimitBucket"'); }
    await db.query('DELETE FROM "AuditLog" WHERE "targetId" IN ($1, $2)', [member.id, duplicate.id]);
    await prisma.user.delete({ where: { id: member.id } }); await prisma.user.delete({ where: { id: duplicate.id } });
    await db.exec('DELETE FROM "RateLimitBucket"');
  });

  await check("division content validates links, unique project addresses and legacy JSON", () => {
    const { subdomainSettingsSchema, parseSubdomainSettings, orderedSections } = load("lib/subdomain-content.ts");
    const project = { slug: "first-project", title: "First project", summary: "A real project", published: false };
    assert.equal(subdomainSettingsSchema.safeParse({ projects: [project, project] }).success, false);
    for (const url of ["javascript:alert(1)", "//evil.example", "/\\evil.example", "data:text/html,test"]) {
      assert.equal(subdomainSettingsSchema.safeParse({ heroButtonUrl: url }).success, false);
      assert.equal(subdomainSettingsSchema.safeParse({ projects: [{ ...project, url }] }).success, false);
    }
    assert.equal(subdomainSettingsSchema.safeParse({ features: [{ title: "Web", desc: "Development", imageUrl: "/uploads/web.png" }] }).success, true);
    const legacy = parseSubdomainSettings(JSON.stringify({ tagline: "Software", features: [{ title: "Web", desc: "Development" }], existingCustomField: "preserved" }));
    assert.equal(legacy.features[0].title, "Web");
    assert.equal(legacy.existingCustomField, "preserved");
    assert.deepEqual(parseSubdomainSettings("invalid JSON"), {});
    assert.equal(parseSubdomainSettings({ projects: "invalid", tagline: "Retained" }).tagline, "Retained");
    assert.deepEqual(orderedSections({ sectionOrder: ["projects", "services"] }), ["projects", "services", "about", "custom", "contact"]);
  });

  await check("service catalog uses service names, supports legacy descriptions and excludes inactive divisions", () => {
    const { buildServiceCatalog } = load("lib/service-catalog.ts");
    const base = { id: "ware", name: "ware", title: "HeptaWare", description: "Software systems", themeColor: "#7138ab", isActive: true };
    const catalog = buildServiceCatalog([{ ...base, settings: { features: [{ title: "API integration", desc: "Connect existing systems" }, { title: "Product development", desc: "From brief to release", url: "https://example.com/services" }], projects: [{ slug: "private", title: "Private project", summary: "Private", published: false }] } }]);
    assert.equal(catalog[0].title, "API integration");
    assert.equal(catalog[0].provider, "HeptaWare");
    assert.equal(catalog[0].href, "https://ware.heptapusgroup.com/services#service-1");
    assert.equal(catalog[1].href, "https://example.com/services");
    assert.ok(!JSON.stringify(catalog).includes("Private project"));
    assert.equal(buildServiceCatalog([{ ...base, settings: {}, isActive: false }]).length, 0);
    assert.equal(buildServiceCatalog([{ ...base, settings: {} }])[0].title, "Software systems");
    assert.equal(buildServiceCatalog([{ ...base, description: null, settings: {} }]).length, 0);
  });

  await check("division API saves independent portfolios and never exposes drafts publicly", async () => {
    const routes = load("app/api/admin/subdomains/route.ts");
    const detail = load("app/api/admin/subdomains/[id]/route.ts");
    const { publicSubdomainSettings } = load("lib/subdomain-content.ts");
    assert.equal((await routes.GET(request("/api/admin/subdomains"))).status, 403);
    const draft = { slug: "private-work", title: "Unannounced project", summary: "Private", published: false };
    const live = { slug: "public-work", title: "Published project", summary: "Public", published: true };
    const body = { name: "ware", title: "HeptaWare", settings: { projects: [draft, live], features: [{ title: "Web development", desc: "Description" }] } };
    const response = await routes.POST(authenticated("/api/admin/subdomains", { method: "POST", body: JSON.stringify(body) }));
    assert.equal(response.status, 201);
    const saved = await response.json();
    assert.equal(saved.settings.projects.length, 2);
    const publicSettings = publicSubdomainSettings(saved.settings);
    assert.deepEqual(publicSettings.projects.map(project => project.slug), ["public-work"]);
    assert.ok(!JSON.stringify(publicSettings).includes("Unannounced"));
    const publicConfig = await load("lib/subdomain.ts").getSubdomainConfig("ware");
    assert.ok(publicConfig);
    assert.deepEqual(publicConfig.settings.projects.map(project => project.slug), ["public-work"]);
    const second = await routes.POST(authenticated("/api/admin/subdomains", { method: "POST", body: JSON.stringify({ name: "flux", title: "HeptaFlux", settings: { projects: [] } }) }));
    assert.equal(second.status, 201);
    assert.deepEqual((await second.json()).settings.projects, []);
    const publicResponse = await load("app/api/subdomains/route.ts").GET();
    assert.equal(publicResponse.status, 200);
    assert.ok((await publicResponse.json()).items.every(item => !("settings" in item)));
    const serviceResponse = await load("app/api/services/route.ts").GET();
    assert.equal(serviceResponse.status, 200);
    const catalog = (await serviceResponse.json()).items;
    assert.equal(catalog.length, 1);
    assert.equal(catalog[0].title, "Web development");
    assert.equal(catalog[0].provider, "HeptaWare");
    assert.ok(!JSON.stringify(catalog).includes("Unannounced"));
    assert.ok(catalog.every(item => !("settings" in item)));
    const update = await detail.PUT(authenticated(`/api/admin/subdomains/${saved.id}`, { method: "PUT", body: JSON.stringify({ settings: { ...saved.settings, projects: [{ ...draft, published: true }, live] } }) }), { params: Promise.resolve({ id: saved.id }) });
    assert.equal(update.status, 200);
    assert.equal(publicSubdomainSettings((await update.json()).settings).projects.length, 2);
    const unsafe = await routes.POST(authenticated("/api/admin/subdomains", { method: "POST", body: JSON.stringify({ ...body, settings: { heroButtonUrl: "javascript:alert(1)" } }) }));
    assert.equal(unsafe.status, 400);
    await db.query('DELETE FROM "Subdomain" WHERE "name" IN ($1, $2)', ["ware", "flux"]);
  });

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
  const users = load("app/api/admin/users/route.ts");
  const adminToken = await auth.createToken({ ...claims, sessionVersion: 1 });
  const manage = (method, body, search = "") => users[method](request(`/api/admin/users${search}`, {
    method, headers: { cookie: `hepta_auth=${adminToken}`, "content-type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }));
  const quiet = async (fn) => { const original = console.error; console.error = () => {}; try { return await fn(); } finally { console.error = original; } };
  const initialPassword = "correct-password-123";
  let managedUser;
  await check("legacy required password reproduces P2011; migration preserves data and enables creation", async () => {
    await db.exec(`ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'legacy-value-preserved'; ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;`);
    const input = { email: "  EDITOR@example.com  ", name: "Managed Editor", password: initialPassword, role: "EDITOR" };
    assert.equal((await quiet(() => manage("POST", input))).status, 503);
    const migration = readFileSync(join(root, "prisma/migrations/20261004090000_relax_legacy_user_password/migration.sql"), "utf8");
    await db.exec(migration);
    await db.exec(migration); // safe when already nullable
    assert.equal((await db.query('SELECT "password" FROM "User" WHERE "id" = $1', [claims.id])).rows[0].password, "legacy-value-preserved");
    const response = await manage("POST", input);
    assert.equal(response.status, 201);
    managedUser = (await response.json()).user;
    assert.equal(managedUser.email, "editor@example.com");
    assert.equal(managedUser.isActive, true);
    assert.ok(!("passwordHash" in managedUser));
    const stored = await prisma.user.findUnique({ where: { id: managedUser.id } });
    assert.equal(stored.password, null);
    assert.ok(await load("lib/hash.ts").compare(initialPassword, stored.passwordHash));
    assert.equal((await manage("POST", input)).status, 409);
  });
  await check("user creation, filtering and pagination require an active administrator", async () => {
    assert.equal((await users.POST(request("/api/admin/users", { method: "POST" }))).status, 403);
    const viewerToken = await auth.createToken({ ...claims, role: "VIEWER", id: managedUser.id, email: managedUser.email });
    assert.equal((await users.GET(request("/api/admin/users", { headers: { cookie: `hepta_auth=${viewerToken}` } }))).status, 403);
    assert.equal((await manage("POST", { email: "weak@example.com", password: "short", role: "ADMIN" })).status, 400);
    assert.equal((await manage("GET", null, "?page=-1")).status, 400);
    const list = await (await manage("GET", null, "?q=managed&role=EDITOR&status=active&pageSize=1")).json();
    assert.equal(list.total, 1); assert.equal(list.items.length, 1); assert.equal(list.items[0].id, managedUser.id);
    assert.ok(!("passwordHash" in list.items[0]));
    assert.equal((await (await manage("GET", null, "?page=2&pageSize=1")).json()).items.length, 1);
  });
  await check("disable and password reset invalidate copied sessions and prevent self lockout", async () => {
    const editorToken = await auth.createToken({ id: managedUser.id, email: managedUser.email, role: "EDITOR", sessionVersion: 0 });
    const editorRequest = () => request("/api/media", { headers: { cookie: `hepta_auth=${editorToken}` } });
    assert.ok(await admin.requireElevated(editorRequest()));
    assert.equal((await manage("PUT", { id: claims.id, isActive: false })).status, 400);
    assert.equal((await manage("PUT", { id: claims.id, role: "EDITOR" })).status, 400);
    assert.equal((await manage("PUT", { id: claims.id, password: initialPassword })).status, 400);
    assert.equal((await manage("PUT", { id: managedUser.id, role: "VIEWER", isActive: false })).status, 400);
    assert.equal((await manage("PUT", { id: managedUser.id, isActive: false })).status, 200);
    assert.equal(await admin.requireElevated(editorRequest()), null);
    // Even a freshly issued token for a disabled account is rejected.
    const disabledToken = await auth.createToken({ id: managedUser.id, email: managedUser.email, role: "EDITOR", sessionVersion: 1 });
    assert.equal(await admin.requireElevated(request("/api/media", { headers: { cookie: `hepta_auth=${disabledToken}` } })), null);
    const login = load("app/api/auth/login/route.ts");
    const attempt = (password) => login.POST(request("/api/auth/login", { method: "POST", body: JSON.stringify({ email: managedUser.email, password }) }));
    assert.equal((await attempt(initialPassword)).status, 401);
    assert.equal((await manage("PUT", { id: managedUser.id, isActive: true })).status, 200);
    assert.equal(await admin.requireElevated(editorRequest()), null);
    const newPassword = "replacement-password-456";
    assert.equal((await manage("PUT", { id: managedUser.id, password: newPassword })).status, 200);
    assert.equal((await attempt(initialPassword)).status, 401);
    const success = await attempt(newPassword); assert.equal(success.status, 200);
    const cookie = success.cookies.get("hepta_auth").value;
    assert.ok(await admin.requireElevated(request("/api/media", { headers: { cookie: `hepta_auth=${cookie}` } })));
    assert.equal((await manage("PUT", { id: managedUser.id, role: "VIEWER" })).status, 200);
    assert.equal(await admin.requireElevated(request("/api/media", { headers: { cookie: `hepta_auth=${cookie}` } })), null);
  });
  await check("audit is atomic, admin-only, survives deletion and contains no credentials", async () => {
    failAudit = true;
    try {
      assert.equal((await quiet(() => manage("POST", { email: "rollback@example.com", password: initialPassword }))).status, 500);
      assert.equal(await prisma.user.findUnique({ where: { email: "rollback@example.com" } }), null);
      assert.equal((await quiet(() => manage("PUT", { id: managedUser.id, isActive: false }))).status, 500);
      assert.equal((await prisma.user.findUnique({ where: { id: managedUser.id } })).isActive, true);
    } finally { failAudit = false; }
    assert.equal((await manage("DELETE", null, `?id=${claims.id}`)).status, 400);
    assert.equal((await manage("DELETE", null, `?id=${managedUser.id}`)).status, 200);
    const audit = load("app/api/admin/audit/route.ts");
    assert.equal((await audit.GET(request("/api/admin/audit"))).status, 403);
    const records = await (await audit.GET(request("/api/admin/audit", { headers: { cookie: `hepta_auth=${adminToken}` } }))).json();
    assert.ok(records.items.some((entry) => entry.action === "USER_DELETED" && entry.targetId === managedUser.id));
    assert.ok(records.items.some((entry) => entry.action === "LOGIN_FAILED"));
    assert.ok(records.items.some((entry) => entry.action === "LOGIN_SUCCEEDED"));
    assert.ok(!JSON.stringify(records).includes(initialPassword));
    assert.ok(!JSON.stringify(records).includes("passwordHash"));
  });
  await check("self-service password changes replace credentials and revoke all older tokens atomically", async () => {
    const ownUser = await prisma.user.create({ data: { email: "self@example.com", role: "EDITOR", passwordHash: await load("lib/hash.ts").hash(initialPassword) } });
    const ownToken = await auth.createToken({ id: ownUser.id, email: ownUser.email, role: "EDITOR", sessionVersion: 0 });
    const change = load("app/api/auth/change-password/route.ts");
    const newPassword = "new-self-password-789";
    const changeRequest = (currentPassword) => request("/api/auth/change-password", { method: "POST", headers: { cookie: `hepta_auth=${ownToken}` }, body: JSON.stringify({ currentPassword, newPassword }) });
    assert.equal((await change.POST(changeRequest("wrong-password"))).status, 401);
    assert.equal((await prisma.user.findUnique({ where: { id: ownUser.id } })).sessionVersion, 0);
    failAudit = true;
    try { assert.equal((await change.POST(changeRequest(initialPassword))).status, 401); }
    finally { failAudit = false; }
    assert.equal((await prisma.user.findUnique({ where: { id: ownUser.id } })).sessionVersion, 0);
    const response = await change.POST(changeRequest(initialPassword));
    assert.equal(response.status, 200);
    const stored = await prisma.user.findUnique({ where: { id: ownUser.id } });
    assert.equal(stored.sessionVersion, 1);
    assert.ok(await load("lib/hash.ts").compare(newPassword, stored.passwordHash));
    assert.equal(await admin.requireElevated(request("/api/media", { headers: { cookie: `hepta_auth=${ownToken}` } })), null);
    const replacement = response.cookies.get("hepta_auth").value;
    assert.ok(await admin.requireElevated(request("/api/media", { headers: { cookie: `hepta_auth=${replacement}` } })));
    assert.equal(await prisma.auditLog.count({ where: { action: "PASSWORD_CHANGED", targetId: ownUser.id } }), 1);
    await prisma.user.delete({ where: { id: ownUser.id } });
  });
  await check("malformed Next-Action requests are rejected before action resolution", async () => {
    const { middleware } = load("middleware.ts");
    assert.equal((await middleware(request("/", { method: "POST", headers: { "next-action": "x" } }))).status, 400);
    assert.equal((await middleware(request("/", { method: "POST", headers: { "next-action": "a".repeat(42) } }))).headers.get("x-middleware-next"), "1");
    assert.equal((await middleware(request("/"))).headers.get("x-middleware-next"), "1");
  });
  await check("health detects schema drift and storage errors and requires administrator access", async () => {
    const { systemHealth } = load("lib/health.ts");
    const healthRoute = load("app/api/admin/health/route.ts");
    assert.equal((await healthRoute.GET(request("/api/admin/health"))).status, 403);
    const healthy = await systemHealth();
    assert.equal(healthy.database.ok, true); assert.equal(healthy.schemaOk, true); assert.equal(healthy.storage.writable, true);
    const healthRequest = request("/api/admin/health", { headers: { cookie: `hepta_auth=${adminToken}` } });
    assert.equal((await healthRoute.GET(healthRequest)).status, 200);
    process.env.UPLOAD_DIR = join(temp, "missing-directory");
    try { assert.equal((await healthRoute.GET(healthRequest)).status, 503); }
    finally { process.env.UPLOAD_DIR = temp; }
    await db.exec('ALTER TABLE "User" RENAME COLUMN "isActive" TO "inactiveTestColumn"');
    try { assert.equal((await systemHealth()).schemaOk, false); }
    finally { await db.exec('ALTER TABLE "User" RENAME COLUMN "inactiveTestColumn" TO "isActive"'); }
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
