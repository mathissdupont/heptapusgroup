import { prisma } from "@/lib/db";
import { ABOUT_CONTENT_KEY, aboutSettingKeys, resolveAboutContent } from "@/lib/about-content";

export async function getAboutContent() {
  const items = await prisma.setting.findMany({
    where: { key: { in: aboutSettingKeys } }, select: { key: true, value: true },
  });
  const settings: Record<string, string | null> = Object.fromEntries(items.map(item => [item.key, item.value]));
  return resolveAboutContent(settings[ABOUT_CONTENT_KEY], settings);
}
