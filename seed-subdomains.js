// seed-subdomains.js
// Kullanım: node seed-subdomains.js
// Tüm 7 alt şirketi Subdomain tablosuna ekler.

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SUBDOMAINS = [
  {
    name: "net",
    title: "HeptaNet",
    description: "Infrastructure & Network Solutions — Altyapı ve ağ çözümleri",
    themeColor: "#22d3ee",
    isActive: true,
    settings: JSON.stringify({
      tagline: "Network Solutions",
      contactEmail: "net@heptapusgroup.com",
      themeKey: "backend",
      features: [
        { title: "Network Architecture", desc: "Ölçeklenebilir ve güvenli ağ altyapısı tasarımı" },
        { title: "Cloud Infrastructure", desc: "Bulut tabanlı altyapı çözümleri ve yönetimi" },
        { title: "DevOps & CI/CD", desc: "Otomasyon ve sürekli entegrasyon pipeline'ları" },
      ],
    }),
  },
  {
    name: "ware",
    title: "HeptaWare",
    description: "Custom Software Development — Özel yazılım geliştirme",
    themeColor: "#c084fc",
    isActive: true,
    settings: JSON.stringify({
      tagline: "Software Solutions",
      contactEmail: "ware@heptapusgroup.com",
      themeKey: "software",
      features: [
        { title: "Web Applications", desc: "Modern ve ölçeklenebilir web uygulamaları" },
        { title: "Mobile Development", desc: "iOS ve Android platformları için native ve cross-platform çözümler" },
        { title: "Enterprise Software", desc: "Kurumsal seviye yazılım çözümleri ve entegrasyonlar" },
      ],
    }),
  },
  {
    name: "core",
    title: "HeptaCore",
    description: "Embedded Systems & Hardware — Gömülü sistemler ve donanım",
    themeColor: "#f472b6",
    isActive: true,
    settings: JSON.stringify({
      tagline: "Embedded Systems",
      contactEmail: "core@heptapusgroup.com",
      themeKey: "qa",
      features: [
        { title: "Embedded Design", desc: "Özel gömülü sistem tasarımı ve prototipleme" },
        { title: "PCB & Hardware", desc: "PCB tasarımı ve donanım mühendisliği" },
        { title: "Firmware Development", desc: "Yüksek performanslı firmware geliştirme" },
      ],
    }),
  },
  {
    name: "dynamics",
    title: "HeptaDynamics",
    description: "Robotics & Automation — Robotik ve otomasyon",
    themeColor: "#f59e0b",
    isActive: true,
    settings: JSON.stringify({
      tagline: "Robotics & Automation",
      contactEmail: "dynamics@heptapusgroup.com",
      themeKey: "mechanical",
      features: [
        { title: "Industrial Robotics", desc: "Endüstriyel robotik sistemler ve otomasyon çözümleri" },
        { title: "Mechanical Design", desc: "3D modelleme ve mekanik tasarım" },
        { title: "Motion Control", desc: "Hassas hareket kontrolü ve servo sistemler" },
      ],
    }),
  },
  {
    name: "sense",
    title: "HeptaSense",
    description: "IoT & Sensor Systems — Nesnelerin İnterneti ve sensör sistemleri",
    themeColor: "#6ee7ff",
    isActive: true,
    settings: JSON.stringify({
      tagline: "IoT & Sensors",
      contactEmail: "sense@heptapusgroup.com",
      themeKey: "frontend",
      features: [
        { title: "IoT Platforms", desc: "Uçtan uca IoT platform geliştirme ve yönetimi" },
        { title: "Sensor Networks", desc: "Dağıtık sensör ağları ve veri toplama" },
        { title: "Edge Computing", desc: "Uç bilgi işlem çözümleri ve gerçek zamanlı analiz" },
      ],
    }),
  },
  {
    name: "flux",
    title: "HeptaFlux",
    description: "Energy & Thermal Systems — Enerji ve termal sistemler",
    themeColor: "#fb923c",
    isActive: true,
    settings: JSON.stringify({
      tagline: "Energy Systems",
      contactEmail: "flux@heptapusgroup.com",
      themeKey: "mechanical",
      features: [
        { title: "Renewable Energy", desc: "Yenilenebilir enerji sistemleri tasarımı ve kurulumu" },
        { title: "Thermal Management", desc: "Endüstriyel termal yönetim çözümleri" },
        { title: "Power Electronics", desc: "Güç elektroniği ve enerji dönüşüm sistemleri" },
      ],
    }),
  },
  {
    name: "shield",
    title: "HeptaShield",
    description: "Cybersecurity & Defense — Siber güvenlik ve savunma",
    themeColor: "#34d399",
    isActive: true,
    settings: JSON.stringify({
      tagline: "Cybersecurity",
      contactEmail: "shield@heptapusgroup.com",
      themeKey: "security",
      features: [
        { title: "Penetration Testing", desc: "Kapsamlı sızma testi ve güvenlik denetimi" },
        { title: "Security Operations", desc: "7/24 güvenlik izleme ve olay müdahale" },
        { title: "Compliance & Audit", desc: "Güvenlik standartları uyumluluğu ve denetim" },
      ],
    }),
  },
];

async function main() {
  console.log("🐙 Seeding subdomains...\n");

  for (const sub of SUBDOMAINS) {
    const result = await prisma.subdomain.upsert({
      where: { name: sub.name },
      update: {
        title: sub.title,
        description: sub.description,
        themeColor: sub.themeColor,
        isActive: sub.isActive,
        settings: sub.settings,
      },
      create: sub,
    });
    console.log(`  ✓ ${result.title} (${result.name}.heptapusgroup.com) — ${result.themeColor}`);
  }

  console.log(`\n✅ ${SUBDOMAINS.length} subdomain seeded successfully.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
