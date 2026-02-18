"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string | null;
}

interface PartnerCarouselProps {
  title?: string;
}

export default function PartnerCarousel({ title }: PartnerCarouselProps = {}) {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then((d) => setPartners(d.items ?? []))
      .catch(() => {});
  }, []);

  if (partners.length === 0) return null;

  // Duplicate list for infinite scroll effect
  const list = [...partners, ...partners];

  return (
    <section className="py-16 border-t border-border/50">
      <div className="mx-auto max-w-6xl px-4 text-center mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {title || "Trusted Partners"}
        </h2>
      </div>
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="flex animate-scroll-left gap-16 px-8" style={{ width: "max-content" }}>
          {list.map((p, i) => (
            <a
              key={`${p.id}-${i}`}
              href={p.website ?? "#"}
              target={p.website ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="flex-shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              title={p.name}
            >
              <Image
                src={p.logoUrl}
                alt={p.name}
                width={120}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
