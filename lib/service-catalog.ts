import { parseSubdomainSettings, servicePath, hasServicePage } from "@/lib/subdomain-content";
import { brandColors } from "@/lib/brand";

export type ServiceCatalogItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  provider: string;
  color: string;
};

type Provider = {
  id: string; name: string; title: string; description: string | null;
  themeColor: string | null; settings: unknown; isActive: boolean;
};

/** Publish service content only; project drafts and other settings stay private. */
export function buildServiceCatalog(providers: Provider[]): ServiceCatalogItem[] {
  return providers.filter(provider => provider.isActive).flatMap(provider => {
    const settings = parseSubdomainSettings(provider.settings);
    const base = `https://${provider.name}.heptapusgroup.com`;
    const services = settings.features || [];
    const common = { provider: provider.title, color: provider.themeColor || brandColors.dustyGrape };
    if (services.length) return services.map((service, index) => ({
      ...common, id: `${provider.id}-${index}`, title: service.title,
      description: service.desc, href: hasServicePage(service) ? `${base}${servicePath(service, index)}` : service.url || `${base}${servicePath(service, index)}`,
    }));

    // Older brands have a short service description but no individual services.
    // Keep that existing description visible while their service list is filled in.
    const title = (settings.tagline || provider.description || "").trim();
    if (!title || title.length > 160 || title === provider.title) return [];
    return [{ ...common, id: `${provider.id}-overview`, title,
      description: settings.tagline && settings.tagline !== provider.description ? provider.description || "" : "",
      href: `${base}/services`,
    }];
  });
}
