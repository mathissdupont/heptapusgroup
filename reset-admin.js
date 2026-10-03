/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (!email || !password || password.length < 10 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("ADMIN_EMAIL ve 10 karakter ile 72 UTF-8 bayt arasında ADMIN_INITIAL_PASSWORD gerekli.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: "Admin", passwordHash, role: "ADMIN", sessionVersion: 0 },
    update: {
      passwordHash,
      role: "ADMIN",
      sessionVersion: { increment: 1 },
    },
  });

  console.log(`Yönetici hesabı hazır: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Yönetici hesabı oluşturulamadı.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
