import { prisma } from "@/lib/db";

export async function getSetting(key: string) {
  try {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting?.value || null;
  } catch (error) {
    console.error(`Setting could not be loaded: ${key}`, error);
    return null;
  }
}

export async function getSettings(keys: string[]) {
  const result: Record<string, string | null> = Object.fromEntries(
    keys.map((key) => [key, null]),
  );

  try {
    const items = await prisma.setting.findMany({ where: { key: { in: keys } } });
    for (const item of items) result[item.key] = item.value;
  } catch (error) {
    console.error("Settings could not be loaded", error);
  }

  return result;
}
