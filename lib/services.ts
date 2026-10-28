import { prisma } from "@/lib/db";
import { buildServiceCatalog } from "@/lib/service-catalog";

export async function getServiceCatalog() {
  const providers = await prisma.subdomain.findMany({
    where: { isActive: true }, orderBy: { name: "asc" },
    select: { id: true, name: true, title: true, description: true, themeColor: true, settings: true, isActive: true },
  });
  return buildServiceCatalog(providers);
}
