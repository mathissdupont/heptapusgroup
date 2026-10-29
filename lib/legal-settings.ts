import { z } from "zod";

export const LEGAL_SETTINGS_KEY = "legalSettings";
export const LEGAL_VERSION = "2026-10-29";
export const legalSettingsSchema = z.object({
  controllerName: z.string().trim().max(300),
  controllerAddress: z.string().trim().max(1500),
  contactEmail: z.email().max(254),
  hostingCountry: z.string().trim().min(1).max(100),
  backupLocations: z.string().trim().max(1500),
  transferStatus: z.enum(["HETZNER_DPA_ONLY", "KVKK_SAFEGUARDS_REVIEWED"]),
  transferDetails: z.string().trim().max(5000),
  retentionDetails: z.string().trim().max(5000),
  additionalTr: z.string().max(20000),
  additionalEn: z.string().max(20000),
  additionalDe: z.string().max(20000),
}).strict().refine(value => value.transferStatus !== "KVKK_SAFEGUARDS_REVIEWED" || value.transferDetails.length > 40, "Aktarım güvenceleri doğrulandıysa kapsam, alıcılar ve dayanak açıklanmalı.");
export type LegalSettings = z.infer<typeof legalSettingsSchema>;
export const defaultLegalSettings: LegalSettings = {
  controllerName: "", controllerAddress: "", contactEmail: "contact@heptapusgroup.com",
  hostingCountry: "Finlandiya", backupLocations: "",
  transferStatus: "HETZNER_DPA_ONLY",
  transferDetails: "Hetzner DPA / AB standart sözleşmesi mevcut. KVKK m.9 kapsamındaki ayrı aktarım güvencesi ve bildirim koşulları henüz doğrulanmadı.",
  retentionDetails: "", additionalTr: "", additionalEn: "", additionalDe: "",
};
export function resolveLegalSettings(raw: unknown): LegalSettings {
  try { const parsed = legalSettingsSchema.safeParse(typeof raw === "string" ? JSON.parse(raw) : raw); return parsed.success ? parsed.data : { ...defaultLegalSettings }; } catch { return { ...defaultLegalSettings }; }
}
export function legalReviewComplete(value: LegalSettings): boolean {
  return Boolean(value.controllerName && value.controllerAddress && value.backupLocations && value.retentionDetails && value.transferStatus === "KVKK_SAFEGUARDS_REVIEWED");
}
