import { z } from "zod";
import { isSafeUrl } from "@/lib/safe-url";

const optionalUrl = z.string().trim().max(1000).refine(value => !value || isSafeUrl(value), "Geçerli bir HTTP(S) adresi veya site içi dosya yolu girin.").nullable().optional();
export const teamGroups = ["BOARD", "LEADERSHIP", "TEAM"] as const;
const teamMemberFields = {
  name: z.string().trim().min(1, "Ad soyad gerekli.").max(160),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Adres için küçük harf, rakam ve tire kullanın."),
  title: z.string().trim().min(1, "Görev gerekli.").max(200),
  group: z.enum(teamGroups),
  summary: z.string().trim().max(2000),
  biography: z.string().max(60_000),
  photoUrl: optionalUrl,
  resumeUrl: optionalUrl,
  linkedinUrl: z.string().trim().max(1000).refine(value => {
    if (!value) return true;
    try { const url = new URL(value); return isSafeUrl(value) && url.protocol === "https:" && ["linkedin.com", "www.linkedin.com"].includes(url.hostname); } catch { return false; }
  }, "https://www.linkedin.com/... biçiminde bir LinkedIn adresi girin.").nullable().optional(),
  order: z.number().int().min(-10_000).max(10_000),
  isActive: z.boolean(),
};
export const teamMemberSchema = z.object({
  ...teamMemberFields,
  group: teamMemberFields.group.default("BOARD"), summary: teamMemberFields.summary.default(""),
  biography: teamMemberFields.biography.default(""), order: teamMemberFields.order.default(0),
  isActive: teamMemberFields.isActive.default(false),
}).strict();
export const teamMemberUpdateSchema = z.object(teamMemberFields).partial().strict().refine(
  value => Object.keys(value).length > 0, "Güncellenecek alan bulunamadı.",
);

export const teamCopy = {
  tr: { BOARD: "Yönetim Kurulu", LEADERSHIP: "Yönetim Ekibi", TEAM: "Ekibimiz", title: "Yönetim ve ekibimiz", description: "Heptapus Group’un arkasındaki insanlar, sorumlulukları ve deneyimleri.", profile: "Özgeçmişi incele", resume: "CV’yi görüntüle", biography: "Özgeçmiş", back: "Ekibimize dön", empty: "Ekip bilgilerimiz yakında burada paylaşılacak." },
  en: { BOARD: "Board of Directors", LEADERSHIP: "Leadership", TEAM: "Our Team", title: "Our people", description: "The people behind Heptapus Group, their responsibilities and experience.", profile: "View profile", resume: "View CV", biography: "Biography", back: "Back to our team", empty: "Our team profiles will be shared here soon." },
  de: { BOARD: "Verwaltungsrat", LEADERSHIP: "Führungsteam", TEAM: "Unser Team", title: "Unser Team", description: "Die Menschen hinter Heptapus Group, ihre Aufgaben und Erfahrungen.", profile: "Profil ansehen", resume: "Lebenslauf ansehen", biography: "Biografie", back: "Zurück zum Team", empty: "Unsere Teamprofile werden hier in Kürze vorgestellt." },
};
