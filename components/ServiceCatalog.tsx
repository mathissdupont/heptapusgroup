import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ServiceCatalogItem } from "@/lib/service-catalog";

export default function ServiceCatalog({ items, heading: Heading = "h3" }: { items: ServiceCatalogItem[]; heading?: "h2" | "h3" }) {
  return <div className="service-catalog">{items.map((service, index) => (
    <article key={service.id} className={`service-catalog-item ${service.description ? "" : "service-catalog-item-compact"}`}>
      <span className="division-index">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <p className="service-provider"><span style={{ backgroundColor: service.color }} />{service.provider}</p>
        <Heading><Link href={service.href} className="service-catalog-link">{service.title}<ArrowUpRight size={21} aria-hidden="true" /></Link></Heading>
      </div>
      {service.description && <p className="service-catalog-description">{service.description}</p>}
    </article>
  ))}</div>;
}
