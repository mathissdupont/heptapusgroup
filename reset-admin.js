const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const p = new PrismaClient();
  
  // List users
  const users = await p.user.findMany({
    select: { id: true, email: true, role: true, name: true },
  });
  console.log("Existing users:", JSON.stringify(users, null, 2));

  if (users.length === 0) {
    // No users — create admin
    const hash = await bcrypt.hash("admin123", 10);
    const u = await p.user.create({
      data: { email: "admin@heptapus.com", name: "Admin", passwordHash: hash, role: "ADMIN" },
    });
    console.log("Created admin:", u.email, "/ password: admin123");
  } else {
    // Reset first admin's password
    const admin = users.find((u) => u.role === "ADMIN") || users[0];
    const hash = await bcrypt.hash("admin123", 10);
    await p.user.update({ where: { id: admin.id }, data: { passwordHash: hash, role: "ADMIN" } });
    console.log("Reset password for:", admin.email, "/ new password: admin123");
  }

  await p.$disconnect();
}

main().catch(console.error);
