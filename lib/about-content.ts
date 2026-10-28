import { z } from "zod";
import { getDictionaries, type Locale } from "@/lib/get-dictionary";

export const ABOUT_CONTENT_KEY = "aboutContent";
export const legacyStatKeys = ["stat_companies", "stat_projects", "stat_team", "stat_years"] as const;
export const aboutSettingKeys = [ABOUT_CONTENT_KEY, ...legacyStatKeys];

const statisticSchema = z.object({
  value: z.string().trim().min(1, "Değer gerekli.").max(40, "Değer en fazla 40 karakter olabilir."),
  label: z.string().trim().min(1, "Başlık gerekli.").max(120, "Başlık en fazla 120 karakter olabilir."),
}).strict();
const milestoneSchema = z.object({
  year: z.string().trim().min(1, "Yıl veya dönem gerekli.").max(40),
  event: z.string().trim().min(1, "Açıklama gerekli.").max(2000),
}).strict();
export const aboutLocaleSchema = z.object({
  stats: z.array(statisticSchema).max(12, "En fazla 12 istatistik eklenebilir."),
  homeStats: z.array(statisticSchema).max(12, "En fazla 12 istatistik eklenebilir."),
  timelineTitle: z.string().trim().min(1, "Bölüm başlığı gerekli.").max(160),
  timeline: z.array(milestoneSchema).max(50, "En fazla 50 dönüm noktası eklenebilir."),
}).strict();
export const aboutContentSchema = z.object({ tr: aboutLocaleSchema, en: aboutLocaleSchema, de: aboutLocaleSchema }).strict();
export type AboutLocaleContent = z.infer<typeof aboutLocaleSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type Statistic = AboutLocaleContent["stats"][number];

function legacyNumber(raw: string | null | undefined, fallback: number) {
  if (!raw?.trim()) return String(fallback);
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 && value <= 1_000_000_000 ? String(value) : String(fallback);
}

export function defaultAboutContent(legacy: Record<string, string | null> = {}): AboutContent {
  const dictionaries = getDictionaries();
  const localized = (locale: Locale): AboutLocaleContent => {
    const dictionary = dictionaries[locale];
    return {
      stats: dictionary.about.stats.map(item => ({ ...item })),
      timelineTitle: dictionary.about.timeline_title,
      timeline: dictionary.about.timeline.map(item => ({ ...item })),
      homeStats: [
        { value: legacyNumber(legacy.stat_companies, 7), label: dictionary.stats.companies },
        { value: `${legacyNumber(legacy.stat_projects, 50)}+`, label: dictionary.stats.projects },
        { value: `${legacyNumber(legacy.stat_team, 30)}+`, label: dictionary.stats.team },
        { value: `${legacyNumber(legacy.stat_years, 5)}+`, label: dictionary.stats.years },
      ],
    };
  };
  return { tr: localized("tr"), en: localized("en"), de: localized("de") };
}

export function resolveAboutContent(raw: string | null | undefined, legacy: Record<string, string | null> = {}): AboutContent {
  const defaults = defaultAboutContent(legacy);
  if (!raw) return defaults;
  try {
    const saved = JSON.parse(raw);
    for (const locale of ["tr", "en", "de"] as const) {
      const parsed = aboutLocaleSchema.safeParse(saved?.[locale]);
      if (parsed.success) defaults[locale] = parsed.data;
    }
  } catch { /* Legacy defaults remain available until content is saved. */ }
  return defaults;
}
