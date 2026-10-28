"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ServiceCatalog from "@/components/ServiceCatalog";
import type { ServiceCatalogItem } from "@/lib/service-catalog";

interface ServicesOverviewProps {
  t?: { title: string; subtitle: string; all_services?: string };
}

export default function ServicesOverview({ t }: ServicesOverviewProps) {
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => { if (!r.ok) throw new Error("Services unavailable"); return r.json(); })
      .then((d) => {
        const items = Array.isArray(d.items) ? d.items : [];
        setServices(items);
      })
      .catch(() => {});
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="group-services py-20" id="services">
      <div>
        <div className="group-section-heading mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">{t?.title ?? "Our Services"}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t?.subtitle ?? "Explore the services we offer for your product and operational needs."}
          </p>
        </div>
        <ServiceCatalog items={services.slice(0, 6)} />
        <div className="mt-7 flex justify-end"><Link href="/services" className="division-text-link">{t?.all_services ?? "All services"}<ArrowUpRight size={17} /></Link></div>
      </div>
    </section>
  );
}
