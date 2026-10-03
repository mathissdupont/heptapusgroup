import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import nextEnv from "@next/env";
import { RotatingLog } from "./rotating-log.mjs";

const root = resolve(import.meta.dirname, "..");
nextEnv.loadEnvConfig(root, false);
process.env.UPLOAD_DIR ||= join(root, "data", "uploads");

const logDirectory = process.env.LOG_DIR || join(root, "data", "logs");
const appLogPath = process.env.APP_LOG_PATH || join(logDirectory, "app.log");
const errorLogPath = process.env.ERROR_LOG_PATH || join(logDirectory, "error.log");

const appLog = new RotatingLog(appLogPath);
const errorLog = new RotatingLog(errorLogPath);
const serverPath = existsSync(join(root, "server.js"))
  ? join(root, "server.js") : join(root, ".next", "standalone", "server.js");
if (!existsSync(serverPath)) throw new Error("Production build is missing. Run npm run build first.");
const server = spawn(process.execPath, [serverPath], {
  cwd: root,
  env: process.env,
  stdio: ["inherit", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  if (!appLog.write(chunk)) server.stdout.pause();
});
appLog.on("drain", () => server.stdout.resume());

server.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
  if (!errorLog.write(chunk)) server.stderr.pause();
});
errorLog.on("drain", () => server.stderr.resume());
for (const log of [appLog, errorLog]) {
  log.on("error", () => {
    process.stderr.write("[launcher] Log storage failed.\n");
    process.exitCode = 1;
    server.kill("SIGTERM");
  });
}

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("error", (error) => {
  const line = `[launcher] ${error.stack || error.message}\n`;
  process.stderr.write(line);
  errorLog.write(line);
  process.exitCode = 1;
});

server.on("close", (code, signal) => {
  appLog.end();
  errorLog.end();
  process.exitCode ||= code ?? (signal ? 1 : 0);
});
