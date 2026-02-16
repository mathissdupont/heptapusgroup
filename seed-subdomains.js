// seed-subdomains.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding subdomains...');

  // Create flux subdomain
  await prisma.subdomain.upsert({
    where: { name: 'flux' },
    update: {},
    create: {
      name: 'flux',
      title: 'HeptaFlux',
      description: 'Energy & Thermal Systems Division',
      themeColor: '#f59e0b',
      isActive: true,
      settings: JSON.stringify({
        companyType: 'energy',
        contactEmail: 'info@flux.heptapusgroup.com',
      }),
    },
  });

  // Create net subdomain
  await prisma.subdomain.upsert({
    where: { name: 'net' },
    update: {},
    create: {
      name: 'net',
      title: 'HeptaNet',
      description: 'Infrastructure & Backend Division',
      themeColor: '#3b82f6',
      isActive: true,
      settings: JSON.stringify({
        companyType: 'infrastructure',
        contactEmail: 'info@net.heptapusgroup.com',
      }),
    },
  });

  console.log('✅ Subdomains seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding subdomains:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
