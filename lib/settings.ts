import { prisma } from "@/lib/db";
import { Setting } from "@/-prisma/client";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function getSetting(key: string) {
  const s = await prisma.setting.findUnique({ where: { key } });
  return s?.value || null;
}

export async function getSettings(keys: string[]) {
  const items = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map: Record<string,string|null> = {};
keys.forEach((k: string) => {
  const found = items.find((i: Setting) => i.key === k);
  map[k] = found?.value || null;
});
  return map;
}
