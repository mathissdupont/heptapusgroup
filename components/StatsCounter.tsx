"use client";

import useSWR from "swr";
import { jfetch } from "@/lib/fetcher";
import type { Locale } from "@/lib/get-dictionary";
import type { AboutLocaleContent } from "@/lib/about-content";

export default function StatsCounter({ lang }: { lang: Locale }) {
  const { data, isLoading } = useSWR<{ content: AboutLocaleContent }>(`/api/about?lang=${lang}`, jfetch);
  if (isLoading) return <section className="py-20 border-y border-border" aria-busy="true"><div className="content-stats-grid gap-8" data-count={4}>{[0, 1, 2, 3].map(index => <div key={index} className="h-20 rounded bg-muted animate-pulse" />)}</div></section>;
  const stats = data?.content.homeStats || [];
  if (!stats.length) return null;

  return <section className="py-20 border-y border-border bg-card/60">
    <div className="mx-auto max-w-6xl px-4">
      <div className="content-stats-grid gap-8 text-center" data-count={stats.length}>
        {stats.map((stat, index) => <div key={index} className="min-w-0">
          <div className="group-stats-number text-4xl md:text-5xl font-medium mb-2 break-words">{stat.value}</div>
          <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider break-words">{stat.label}</div>
        </div>)}
      </div>
    </div>
  </section>;
}
