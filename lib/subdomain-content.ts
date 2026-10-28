import { z } from "zod";
import { isSafeUrl } from "@/lib/safe-url";

const text = (max: number) => z.string().trim().max(max);
const url = text(1000).refine(value => !value || isSafeUrl(value), "Site içi bir yol veya geçerli bir HTTP(S) adresi girin.");

export const serviceSchema = z.object({
  title: text(160).min(1, "Hizmet başlığı gerekli."),
  desc: text(4000),
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

export const subdomainSettingsSchema = z.object({
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
  features: z.array(serviceSchema).max(30).optional(),
  projects: z.array(divisionProjectSchema).max(60).refine(
    items => new Set(items.map(item => item.slug)).size === items.length,
    "Proje adresleri birbirinden farklı olmalı.",
  ).optional(),
  sectionOrder: z.array(z.enum(sectionKeys)).max(5).refine(items => new Set(items).size === items.length, "Bölümler tekrarlanamaz.").optional(),
  hiddenSections: z.array(z.enum(sectionKeys)).max(5).optional(),
  socialLinks: z.object({ github: url.optional(), linkedin: url.optional(), twitter: url.optional(), instagram: url.optional(), website: url.optional() }).passthrough().optional(),
}).passthrough();

export type SubdomainSettings = z.infer<typeof subdomainSettingsSchema>;
export type DivisionProject = z.infer<typeof divisionProjectSchema>;
export type DivisionService = z.infer<typeof serviceSchema>;
export type Division = {
  name: string; title: string; description?: string | null; logoUrl?: string | null;
  themeColor?: string | null; settings?: unknown;
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
  return { ...settings, projects: settings.projects?.filter(project => project.published) };
}

export const divisionCopy = {
  tr: { home: "Ana sayfa", about: "Hakkımızda", services: "Hizmetler", projects: "Projeler", contact: "İletişim", group: "Heptapus Group bünyesinde", explore: "Projeleri inceleyin", talk: "Birlikte çalışalım", all: "Tüm projeler", detail: "Projeyi incele", visit: "Web sitesini ziyaret et", back: "Projelere dön", expertise: "Uzmanlık alanlarımız", work: "Seçili projeler", contactTitle: "Bir sonraki projenizi konuşalım.", contactText: "İhtiyacınızı anlatın; kapsamı ve nasıl ilerleyebileceğimizi birlikte değerlendirelim.", empty: "Projelerimiz yakında burada.", main: "Grup sitesi", menu: "Menü", privacy: "Gizlilik", terms: "Kullanım koşulları" },
  en: { home: "Home", about: "About", services: "Services", projects: "Projects", contact: "Contact", group: "Part of Heptapus Group", explore: "Explore our work", talk: "Work with us", all: "All projects", detail: "View project", visit: "Visit website", back: "Back to projects", expertise: "Our expertise", work: "Selected work", contactTitle: "Let’s talk about your next project.", contactText: "Tell us what you have in mind. We’ll work through the scope and next steps together.", empty: "Our projects will be here soon.", main: "Group website", menu: "Menu", privacy: "Privacy", terms: "Terms" },
  de: { home: "Startseite", about: "Über uns", services: "Leistungen", projects: "Projekte", contact: "Kontakt", group: "Ein Unternehmen der Heptapus Group", explore: "Projekte entdecken", talk: "Zusammenarbeiten", all: "Alle Projekte", detail: "Projekt ansehen", visit: "Website besuchen", back: "Zurück zu Projekten", expertise: "Unsere Fachgebiete", work: "Ausgewählte Projekte", contactTitle: "Sprechen wir über Ihr nächstes Projekt.", contactText: "Erzählen Sie uns von Ihrer Idee. Gemeinsam klären wir den Umfang und die nächsten Schritte.", empty: "Unsere Projekte erscheinen hier in Kürze.", main: "Gruppenwebsite", menu: "Menü", privacy: "Datenschutz", terms: "Nutzungsbedingungen" },
};

export function getDivisionCopy(settings: SubdomainSettings) { return divisionCopy[settings.locale || "en"]; }
