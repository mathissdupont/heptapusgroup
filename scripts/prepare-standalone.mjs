import { cp, access } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const destination = join(root, ".next", "standalone");
await access(join(destination, "server.js"));
await cp(join(root, ".next", "static"), join(destination, ".next", "static"), { recursive: true });
await cp(join(root, "public"), join(destination, "public"), { recursive: true });
console.log("Standalone static assets prepared.");
