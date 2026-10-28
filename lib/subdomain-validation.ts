import { z } from "zod";
import { isSafeUrl } from "@/lib/safe-url";
import { subdomainSettingsSchema } from "@/lib/subdomain-content";

export const subdomainSchema = z.object({
  name: z.string().trim().min(1).max(63).regex(/^(?!-)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(2000).nullable().optional(),
  logoUrl: z.string().trim().max(1000).refine(value => !value || isSafeUrl(value), "Geçerli bir logo adresi girin.").nullable().optional(),
  themeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
  isActive: z.boolean().optional(),
  settings: subdomainSettingsSchema.nullable().optional(),
});
