import { prisma } from "@/lib/db";

export function getPublishedTeam() {
  return prisma.teamMember.findMany({
    where: { isActive: true }, orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, title: true, group: true, summary: true, photoUrl: true },
  });
}

export function getPublishedMember(slug: string) {
  return prisma.teamMember.findUnique({ where: { slug, isActive: true } });
}
