#!/usr/bin/env node
// migrate-uploads.js
// Mevcut public/uploads/ dosyalarını data/uploads/'a kopyalar.
// Sunucuda bir kere çalıştırılması yeterli:
//   node migrate-uploads.js

const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "public", "uploads");
const dst = path.join(__dirname, "data", "uploads");

if (!fs.existsSync(src)) {
  console.log("public/uploads/ dizini bulunamadı, kopyalanacak dosya yok.");
  process.exit(0);
}

fs.mkdirSync(dst, { recursive: true });

const files = fs.readdirSync(src);
let copied = 0;

for (const file of files) {
  const srcFile = path.join(src, file);
  const dstFile = path.join(dst, file);
  
  if (fs.statSync(srcFile).isFile() && !fs.existsSync(dstFile)) {
    fs.copyFileSync(srcFile, dstFile);
    copied++;
    console.log(`  ✓ ${file}`);
  }
}

console.log(`\n${copied} dosya kopyalandı. (data/uploads/)`);
console.log("Artık yeni yüklemeler data/uploads/ altına kaydedilecek.");
