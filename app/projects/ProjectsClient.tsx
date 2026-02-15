"use client";

import { useMemo, useState } from "react";
import { useProjects, type Project } from "@/hooks/useProjects";
import ElectricBorder from "@/components/ElectricBorder";
import Link from "next/link";

// Props tip tanımı
interface ProjectsClientProps {
  t: {
    title: string;
    description: string;
    error: string;
    no_projects: string;
    examine: string;
    all: string;
  };
  lang?: string;
}

export default function ProjectsClient({ t }: ProjectsClientProps) {
  const { projects, isLoading, error } = useProjects();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Unique tags from all projects
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach((p: Project) => {
      if (Array.isArray(p.tags)) p.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [projects]);

  // Filtered projects
  const filtered = useMemo(() => {
    if (!activeTag) return projects;
    return projects.filter((p: Project) => Array.isArray(p.tags) && p.tags.includes(activeTag));
  }, [projects, activeTag]);

  return (
    <section className="pb-14">
      <h1 className="text-3xl font-extrabold text-foreground text-center mt-0">{t.title}</h1>
      <p className="text-muted-foreground max-w-[820px] pb-6 text-center mx-auto">
        {t.description}
      </p>

      {/* Category Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              activeTag === null
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {t.all}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                activeTag === tag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-destructive">{t.error}</p>}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[260px] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center">{t.no_projects}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: Project) => (
            <ElectricBorder
              key={p.id}
              color="#7df9ff"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
              desktopOnly
            >
              <article className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col h-full">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} className="w-full aspect-[16/9] object-cover rounded-xl mb-3 border border-border" loading="lazy" />
                ) : (
                  <div className="w-full aspect-[16/9] rounded-xl mb-3 bg-muted border border-border" />
                )}

                <h3 className="font-bold text-card-foreground m-0">{p.title}</h3>
                <p className="text-muted-foreground text-sm mt-1.5 mb-2">{p.summary}</p>

                <div className="flex gap-2 flex-wrap mt-auto">
                  <span className="border border-border rounded-full px-2 py-1 text-xs text-muted-foreground uppercase">
                    {p.status}
                  </span>
                  {Array.isArray(p.tags) &&
                    p.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="border border-border rounded-full px-2 py-1 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                </div>

                <Link
                  href={`/projects/${p.slug}`}
                  className="mt-3 w-full text-center py-2.5 rounded-xl font-bold bg-primary text-primary-foreground no-underline text-sm block"
                >
                  {t.examine}
                </Link>
              </article>
            </ElectricBorder>
          ))}
        </div>
      )}
    </section>
  );
}
