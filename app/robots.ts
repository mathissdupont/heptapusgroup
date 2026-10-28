import type { MetadataRoute } from "next";
import { getSubdomain } from "@/lib/subdomain";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const name = await getSubdomain();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login", "/register"],
      },
    ],
    sitemap: `https://${name ? `${name}.` : ""}heptapusgroup.com/sitemap.xml`,
  };
}
