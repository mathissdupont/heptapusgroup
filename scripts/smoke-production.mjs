import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { request as httpRequest } from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const probe = createServer();
probe.listen(0, "127.0.0.1"); await once(probe, "listening");
const port = probe.address().port;
await new Promise((done) => probe.close(done));
const directory = await mkdtemp(join(tmpdir(), "hepta-smoke-"));
const base = `http://127.0.0.1:${port}`;
// Node 20 fetch may replace a custom Host header. Use HTTP directly to exercise
// the same virtual-host routing used by the production reverse proxy.
function divisionRequest(path) {
  return new Promise((resolve, reject) => {
    const request = httpRequest(`${base}${path}`, { headers: { host: "ware.heptapusgroup.com" } }, response => {
      response.resume();
      resolve({ status: response.statusCode, headers: new Headers(Object.entries(response.headers).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)])) });
    });
    request.on("error", reject); request.end();
  });
}
const server = spawn(process.execPath, ["scripts/start-production.mjs"], {
  cwd: resolve(import.meta.dirname, ".."),
  env: { ...process.env,
    NODE_ENV: "production", PORT: String(port), HOSTNAME: "127.0.0.1", APP_ORIGIN: base,
    DATABASE_URL: "postgresql://test:test@127.0.0.1:1/test?connect_timeout=1",
    AUTH_SECRET: "smoke-test-only-secret-with-32-characters", AUTH_COOKIE_DOMAIN: "",
    TURNSTILE_SECRET_KEY: "", TRUSTED_PROXY_IP_HEADER: "",
    UPLOAD_DIR: join(directory, "uploads"), LOG_DIR: directory,
    APP_LOG_PATH: join(directory, "app.log"), ERROR_LOG_PATH: join(directory, "error.log"),
  }, stdio: ["ignore", "pipe", "pipe"],
});
let output = "";
server.stdout.on("data", (chunk) => { output = (output + chunk).slice(-10_000); });
server.stderr.on("data", (chunk) => { output = (output + chunk).slice(-10_000); });
try {
  let ready = false;
  for (let index = 0; index < 100; index++) {
    if (server.exitCode !== null) throw new Error(`Production launcher exited: ${output}`);
    const response = await fetch(`${base}/api/auth/me`).catch(() => null);
    if (response?.ok) { ready = true; break; }
    await new Promise((done) => setTimeout(done, 100));
  }
  assert.ok(ready, `Production server did not become ready: ${output}`);
  const me = await fetch(`${base}/api/auth/me`); assert.deepEqual(await me.json(), { user: null });
  assert.equal(me.headers.get("cache-control"), "no-store");
  const unavailableLogin = await fetch(`${base}/api/auth/login`, { method: "POST", headers: { "content-type": "application/json", origin: base }, body: JSON.stringify({ email: "smoke@example.com", password: "test-only-password" }) });
  assert.equal(unavailableLogin.status, 503);
  assert.equal((await unavailableLogin.json()).code, "DATABASE_UNAVAILABLE");
  const admin = await fetch(`${base}/admin`, { redirect: "manual" });
  assert.equal(admin.status, 307); assert.ok(admin.headers.get("location").endsWith("/login"));
  assert.equal((await fetch(`${base}/api/admin/users`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/team`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/about`)).status, 401);
  assert.equal((await fetch(`${base}/api/about?lang=unsupported`)).status, 400);
  assert.equal((await fetch(`${base}/api/admin/audit`)).status, 401);
  assert.equal((await fetch(`${base}/api/admin/health`)).status, 401);
  assert.equal((await fetch(`${base}/login`, { method: "POST", headers: { "next-action": "x" } })).status, 400);
  assert.equal((await fetch(`${base}/api/upload`, { method: "POST" })).status, 403);
  assert.equal((await fetch(`${base}/api/auth/register`, { method: "POST" })).status, 403);
  assert.equal((await fetch(`${base}/api/auth/logout`, { method: "POST", headers: { origin: "https://evil.example" } })).status, 403);
  const login = await fetch(`${base}/login`); assert.equal(login.status, 200);
  assert.equal(login.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(me.headers.get("x-robots-tag"), "noindex, nofollow");
  const divisionHome = await divisionRequest("/home");
  assert.equal(divisionHome.status, 308);
  assert.equal(divisionHome.headers.get("location"), "https://ware.heptapusgroup.com/");
  const corporatePage = await divisionRequest("/team");
  assert.equal(corporatePage.status, 308);
  assert.equal(corporatePage.headers.get("location"), "https://heptapusgroup.com/team");
  assert.equal((await divisionRequest("/tr/api/admin/users")).status, 404);
  assert.equal(login.headers.get("x-content-type-options"), "nosniff");
  assert.equal(login.headers.get("x-frame-options"), "DENY");
  const html = await login.text();
  assert.ok(html.includes("/brand/favicon.svg?v=2"), "Browser icon must use the versioned compact mark");
  const icon = await fetch(`${base}/brand/favicon.svg?v=2`);
  assert.equal(icon.status, 200);
  assert.ok(!(await icon.text()).includes("<rect"), "Favicon must not add a square background");
  const ico = new DataView(await (await fetch(`${base}/favicon.ico`)).arrayBuffer());
  assert.equal(ico.getUint16(2, true), 1);
  assert.equal(ico.getUint16(4, true), 4, "ICO must contain dedicated small sizes");
  const stylesheets = [...new Set([...html.matchAll(/href="([^"?]+\.css)/g)].map(match => match[1]))];
  const css = (await Promise.all(stylesheets.map(async path => {
    const response = await fetch(`${base}${path}`); assert.equal(response.status, 200); return response.text();
  }))).join("\n");
  const fonts = [...new Set([...css.matchAll(/url\(["']?([^"')]+\.woff2)/g)].map(match => match[1]))];
  assert.ok(fonts.length, "Brand typography has no locally served font files");
  await Promise.all(fonts.map(async path => { assert.equal((await fetch(new URL(path, base))).status, 200); }));
  const brandLogo = await fetch(`${base}/brand/heptapus-horizontal-black.png`);
  assert.equal(brandLogo.status, 200);
  assert.ok(brandLogo.headers.get("content-type")?.startsWith("image/png"));
  const asset = /src="(\/_next\/static\/[^"?]+\.js)/.exec(html)?.[1];
  assert.ok(asset, "Login page has no static JS asset");
  assert.equal((await fetch(`${base}${asset}`)).status, 200);
  console.log("PASS production launcher, anonymous auth, admin guards, malformed actions, closed registration, CSRF, security headers and static assets");
} finally {
  const exited = once(server, "exit");
  server.kill("SIGTERM");
  const timeout = setTimeout(() => server.kill("SIGKILL"), 5000);
  if (server.exitCode === null) await exited;
  clearTimeout(timeout);
  await rm(directory, { recursive: true, force: true });
}
