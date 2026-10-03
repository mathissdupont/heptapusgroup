import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const probe = createServer();
probe.listen(0, "127.0.0.1"); await once(probe, "listening");
const port = probe.address().port;
await new Promise((done) => probe.close(done));
const directory = await mkdtemp(join(tmpdir(), "hepta-smoke-"));
const base = `http://127.0.0.1:${port}`;
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
  const admin = await fetch(`${base}/admin`, { redirect: "manual" });
  assert.equal(admin.status, 307); assert.ok(admin.headers.get("location").endsWith("/login"));
  assert.equal((await fetch(`${base}/api/admin/users`)).status, 401);
  assert.equal((await fetch(`${base}/api/upload`, { method: "POST" })).status, 403);
  assert.equal((await fetch(`${base}/api/auth/register`, { method: "POST" })).status, 403);
  assert.equal((await fetch(`${base}/api/auth/logout`, { method: "POST", headers: { origin: "https://evil.example" } })).status, 403);
  const login = await fetch(`${base}/login`); assert.equal(login.status, 200);
  assert.equal(login.headers.get("x-content-type-options"), "nosniff");
  assert.equal(login.headers.get("x-frame-options"), "DENY");
  const html = await login.text();
  const asset = /src="(\/_next\/static\/[^"?]+\.js)/.exec(html)?.[1];
  assert.ok(asset, "Login page has no static JS asset");
  assert.equal((await fetch(`${base}${asset}`)).status, 200);
  console.log("PASS production launcher, anonymous auth, admin guards, closed registration, CSRF, security headers and static assets");
} finally {
  const exited = once(server, "exit");
  server.kill("SIGTERM");
  const timeout = setTimeout(() => server.kill("SIGKILL"), 5000);
  if (server.exitCode === null) await exited;
  clearTimeout(timeout);
  await rm(directory, { recursive: true, force: true });
}
