"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SubdomainItem {
  id: string;
  name: string;
  title: string;
  description?: string | null;
  themeColor?: string | null;
  isActive: boolean;
}

interface ServicesOverviewProps {
  t?: { title: string; subtitle: string };
}

export default function ServicesOverview({ t }: ServicesOverviewProps) {
  const [services, setServices] = useState<SubdomainItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/subdomains")
      .then((r) => r.json())
      .then((d) => {
        const items = (d.items ?? d ?? []).filter((s: SubdomainItem) => s.isActive);
        setServices(items);
      })
      .catch(() => {});
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="py-20 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground mb-3">{t?.title ?? "Our Companies"}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t?.subtitle ?? "Seven specialized sub-companies, one unified technology ecosystem."}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((s) => (
            <Link
              key={s.id}
              href={`/home#${s.name}`}
              className="group rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                className="h-1.5 w-12 rounded-full mb-4"
                style={{ backgroundColor: s.themeColor || "#7c3aed" }}
              />
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-foreground/80 transition-colors">
                {s.title}
              </h3>
              {s.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
