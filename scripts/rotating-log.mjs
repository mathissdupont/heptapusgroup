import { mkdir, open, rename, unlink } from "node:fs/promises";
import { dirname } from "node:path";
import { Writable } from "node:stream";

/** One writer per launcher; retain only three bounded historical files. */
export class RotatingLog extends Writable {
  constructor(path, maxBytes = 10 * 1024 * 1024, backups = 3) {
    super(); this.path = path; this.maxBytes = maxBytes; this.backups = backups;
    this.file = null; this.size = 0;
  }
  async initialize() {
    await mkdir(dirname(this.path), { recursive: true });
    this.file = await open(this.path, "a", 0o640);
    this.size = (await this.file.stat()).size;
  }
  async rotate() {
    await this.file.close(); this.file = null;
    const ignoreMissing = (error) => { if (error.code !== "ENOENT") throw error; };
    await unlink(`${this.path}.${this.backups}`).catch(ignoreMissing);
    for (let index = this.backups - 1; index >= 1; index--) {
      await rename(`${this.path}.${index}`, `${this.path}.${index + 1}`).catch(ignoreMissing);
    }
    await rename(this.path, `${this.path}.1`).catch(ignoreMissing);
    await this.initialize();
  }
  _write(chunk, encoding, callback) {
    (async () => {
      if (!this.file) await this.initialize();
      if (this.size && this.size + chunk.length > this.maxBytes) await this.rotate();
      await this.file.writeFile(chunk); this.size += chunk.length;
    })().then(() => callback(), callback);
  }
  _final(callback) { (this.file?.close() ?? Promise.resolve()).then(() => { this.file = null; callback(); }, callback); }
  _destroy(error, callback) { (this.file?.close() ?? Promise.resolve()).then(() => callback(error), callback); }
}
