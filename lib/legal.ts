import { prisma } from "@/lib/db";
import { LEGAL_SETTINGS_KEY, resolveLegalSettings } from "@/lib/legal-settings";
export async function getLegalSettings() {
  const setting = await prisma.setting.findUnique({ where: { key: LEGAL_SETTINGS_KEY } });
  return resolveLegalSettings(setting?.value);
}
