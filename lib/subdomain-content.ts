import { z } from "zod";
import { isSafeUrl } from "@/lib/safe-url";

const text = (max: number) => z.string().trim().max(max);
const url = text(1000).refine(value => !value || isSafeUrl(value), "Site içi bir yol veya geçerli bir HTTP(S) adresi girin.");

export const serviceSchema = z.object({
  title: text(160).min(1, "Hizmet başlığı gerekli."),
  desc: text(4000),
  slug: text(160).refine(value => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), "Adres küçük harf, rakam ve tire içermeli.").optional(),
  content: z.string().max(60_000).optional(),
  imageUrl: url.optional(),
  url: url.optional(),
}).passthrough();

export const divisionProjectSchema = z.object({
  slug: text(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Proje adresinde küçük harf, rakam ve tire kullanın."),
  title: text(200).min(1, "Proje başlığı gerekli."),
  summary: text(3000),
  category: text(100).optional(),
  imageUrl: url.optional(),
  url: url.optional(),
  content: z.string().max(60_000).optional(),
  published: z.boolean().default(false),
}).passthrough();

export const sectionKeys = ["about", "services", "projects", "custom", "contact"] as const;
export type SectionKey = typeof sectionKeys[number];
export const sectionLabels: Record<SectionKey, string> = {
  about: "Hakkımızda", services: "Hizmetler", projects: "Projeler", custom: "Ek içerik", contact: "İletişim",
};

const baseSubdomainSettingsSchema = z.object({
  seo: z.object({ title: text(120).optional(), description: text(320).optional(), image: url.optional() }).optional(),
  tagline: text(250).optional(),
  contactEmail: text(254).refine(value => !value || z.email().safeParse(value).success, "Geçerli bir e-posta girin.").optional(),
  themeKey: text(100).optional(),
  aboutText: text(30_000).optional(),
  heroImage: url.optional(),
  heroTitle: text(250).optional(),
  heroButtonText: text(80).optional(),
  heroButtonUrl: url.optional(),
  servicesTitle: text(200).optional(),
  projectsTitle: text(200).optional(),
  contactTitle: text(200).optional(),
  contactText: text(3000).optional(),
  customTitle: text(200).optional(),
  customText: text(30_000).optional(),
  locale: z.enum(["tr", "en", "de"]).optional(),
  features: z.array(serviceSchema).max(30).refine(items => {
    const slugs = items.map(item => item.slug).filter(Boolean);
    return new Set(slugs).size === slugs.length;
  }, "Hizmet adresleri birbirinden farklı olmalı.").optional(),
  projects: z.array(divisionProjectSchema).max(60).refine(
    items => new Set(items.map(item => item.slug)).size === items.length,
    "Proje adresleri birbirinden farklı olmalı.",
  ).optional(),
  sectionOrder: z.array(z.enum(sectionKeys)).max(5).refine(items => new Set(items).size === items.length, "Bölümler tekrarlanamaz.").optional(),
  hiddenSections: z.array(z.enum(sectionKeys)).max(5).optional(),
  socialLinks: z.object({ github: url.optional(), linkedin: url.optional(), twitter: url.optional(), instagram: url.optional(), website: url.optional() }).passthrough().optional(),
}).passthrough();

export const divisionTranslationSchema = baseSubdomainSettingsSchema.omit({ locale: true }).extend({
  published: z.boolean().default(false),
  description: text(2000).optional(),
}).strict().refine(value => !value.published || !!(value.description && value.heroTitle && value.aboutText), "Dili yayınlamak için açıklama, ana başlık ve hakkımızda içeriği gerekli.");
export const subdomainSettingsSchema = baseSubdomainSettingsSchema.extend({
  translations: z.object({ tr: divisionTranslationSchema.optional(), en: divisionTranslationSchema.optional(), de: divisionTranslationSchema.optional() }).optional(),
});

export type SubdomainSettings = z.infer<typeof subdomainSettingsSchema>;
export type DivisionProject = z.infer<typeof divisionProjectSchema>;
export type DivisionService = z.infer<typeof serviceSchema>;
export function hasServicePage(service: DivisionService): boolean { return !!(service.slug && service.content?.trim()); }
export function servicePath(service: DivisionService, index: number): string {
  return hasServicePage(service) ? `/services/${service.slug}` : `/services#service-${index + 1}`;
}
export type Division = {
  name: string; title: string; description?: string | null; logoUrl?: string | null;
  themeColor?: string | null; settings?: unknown;
  localePrefix?: string;
  languageVersions?: { locale: string; prefix: string; paths: string[] }[];
};

// Accept the JSON objects and serialized JSON used by older records. Invalid
// individual fields must not prevent an otherwise valid division from rendering.
export function parseSubdomainSettings(raw: unknown): SubdomainSettings {
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const result: Record<string, unknown> = { ...value };
    for (const [key, schema] of Object.entries(subdomainSettingsSchema.shape)) {
      const parsed = schema.safeParse(value[key]);
      if (parsed.success) result[key] = parsed.data;
      else delete result[key];
    }
    return result as SubdomainSettings;
  } catch { return {}; }
}

export function orderedSections(settings: SubdomainSettings): SectionKey[] {
  return [...new Set([...(settings.sectionOrder || []), ...sectionKeys])];
}

export function publicSubdomainSettings(raw: unknown): SubdomainSettings {
  const settings = parseSubdomainSettings(raw);
  const translations = settings.translations ? Object.fromEntries(Object.entries(settings.translations)
    .filter(([, variant]) => variant?.published)
    .map(([locale, variant]) => [locale, { ...variant, projects: variant?.projects?.filter(project => project.published) }])) : undefined;
  return { ...settings, translations, projects: settings.projects?.filter(project => project.published) };
}

export const divisionCopy = {
  tr: { home: "Ana sayfa", about: "Hakkımızda", services: "Hizmetler", projects: "Projeler", contact: "İletişim", group: "Heptapus Group bünyesinde", explore: "Projeleri inceleyin", talk: "Birlikte çalışalım", all: "Tüm projeler", detail: "Projeyi incele", visit: "Web sitesini ziyaret et", back: "Projelere dön", expertise: "Uzmanlık alanlarımız", work: "Seçili projeler", contactTitle: "Bir sonraki projenizi konuşalım.", contactText: "İhtiyacınızı anlatın; kapsamı ve nasıl ilerleyebileceğimizi birlikte değerlendirelim.", empty: "Projelerimiz yakında burada.", main: "Grup sitesi", menu: "Menü", privacy: "Gizlilik", terms: "Kullanım koşulları" },
  en: { home: "Home", about: "About", services: "Services", projects: "Projects", contact: "Contact", group: "Part of Heptapus Group", explore: "Explore our work", talk: "Work with us", all: "All projects", detail: "View project", visit: "Visit website", back: "Back to projects", expertise: "Our expertise", work: "Selected work", contactTitle: "Let’s talk about your next project.", contactText: "Tell us what you have in mind. We’ll work through the scope and next steps together.", empty: "Our projects will be here soon.", main: "Group website", menu: "Menu", privacy: "Privacy", terms: "Terms" },
  de: { home: "Startseite", about: "Über uns", services: "Leistungen", projects: "Projekte", contact: "Kontakt", group: "Ein Unternehmen der Heptapus Group", explore: "Projekte entdecken", talk: "Zusammenarbeiten", all: "Alle Projekte", detail: "Projekt ansehen", visit: "Website besuchen", back: "Zurück zu Projekten", expertise: "Unsere Fachgebiete", work: "Ausgewählte Projekte", contactTitle: "Sprechen wir über Ihr nächstes Projekt.", contactText: "Erzählen Sie uns von Ihrer Idee. Gemeinsam klären wir den Umfang und die nächsten Schritte.", empty: "Unsere Projekte erscheinen hier in Kürze.", main: "Gruppenwebsite", menu: "Menü", privacy: "Datenschutz", terms: "Nutzungsbedingungen" },
};

export function getDivisionCopy(settings: SubdomainSettings) { return divisionCopy[settings.locale || "en"]; }
