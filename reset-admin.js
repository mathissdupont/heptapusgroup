/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { loadEnvConfig } = require("@next/env");
loadEnvConfig(__dirname, false);

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !z.email().safeParse(email).success || !password || password.length < 10 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("ADMIN_EMAIL ve 10 karakter ile 72 UTF-8 bayt arasında ADMIN_INITIAL_PASSWORD gerekli.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const matches = await prisma.user.findMany({ where: { email: { equals: email, mode: "insensitive" } }, take: 2 });
  if (matches.length > 1) throw new Error("Bu e-postanın farklı harf biçimleriyle birden fazla hesabı var. Önce yinelenen hesapları inceleyin.");
  const user = matches.length ? await prisma.user.update({
    where: { id: matches[0].id },
    data: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
      sessionVersion: { increment: 1 },
    },
  }) : await prisma.user.create({ data: { email, name: "Admin", passwordHash, role: "ADMIN", sessionVersion: 0 } });

  console.log(`Yönetici hesabı hazır: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Yönetici hesabı oluşturulamadı.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
