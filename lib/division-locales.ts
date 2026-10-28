import { type Division, type SubdomainSettings, parseSubdomainSettings, publicSubdomainSettings, hasServicePage } from "@/lib/subdomain-content";

export function divisionPaths(settings: SubdomainSettings): string[] {
  return ["/", "/about", "/contact",
    ...((settings.features || []).length ? ["/services"] : []),
    ...(settings.projects?.some(project => project.published) ? ["/projects"] : []),
    ...(settings.features || []).filter(hasServicePage).map(service => `/services/${service.slug}`),
    ...(settings.projects || []).filter(project => project.published).map(project => `/projects/${project.slug}`)];
}

/** Separate published language editions. Text is never silently copied from another language. */
export function divisionVariants<T extends Division>(division: T): (T & Division)[] {
  const settings = publicSubdomainSettings(division.settings);
  const primary = settings.locale || "en";
  const variants: T[] = [{ ...division, settings, localePrefix: "" }];
  for (const [locale, variant] of Object.entries(settings.translations || {})) {
    if (locale === primary || !variant?.published) continue;
    variants.push({ ...division, description: variant.description, localePrefix: `/${locale}`, settings: {
      // Shared contact identity and visuals; editorial text belongs to its edition.
      contactEmail: settings.contactEmail, socialLinks: settings.socialLinks, heroImage: settings.heroImage,
      ...variant, locale, features: variant.features || [], projects: variant.projects || [],
    } });
  }
  const languageVersions = variants.map(variant => ({ locale: parseSubdomainSettings(variant.settings).locale || "en", prefix: variant.localePrefix || "", paths: divisionPaths(parseSubdomainSettings(variant.settings)) }));
  return variants.map(variant => ({ ...variant, languageVersions }));
}
