import { prisma } from "@/lib/db";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';
import Breadcrumb from "@/components/Breadcrumb";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getTranslatedField } from "@/lib/i18n";
import { ArrowLeft, CalendarDays, Globe, Layers } from "lucide-react";

const dictionaries = getDictionaries();

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getServerLang();
  const p = await prisma.project.findUnique({ where: { slug } });
  if (!p) return { title: "Project Not Found" };

  const title = getTranslatedField(p, "title", lang);
  const summary = getTranslatedField(p, "summary", lang);

  return {
    title: `${title} | Heptapus`,
    description: summary || "Project details",
  };
}

const statusStyle: Record<string, string> = {
  LIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400 dark:border-emerald-400/20",
  UAT: "bg-amber-500/10 text-amber-600 border-amber-500/25 dark:text-amber-400 dark:border-amber-400/20",
  DRAFT: "bg-slate-500/10 text-slate-600 border-slate-500/25 dark:text-slate-400 dark:border-slate-400/20",
};

function normalizeTags(src: unknown): string[] {
  if (Array.isArray(src)) return (src as any[]).map(String).filter(Boolean);
  if (typeof src === "string") {
    try {
      const parsed = JSON.parse(src);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return src.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const lang = await getServerLang();
  const dict = dictionaries[lang];
  const p_text = dict.project_detail;
  const nav = dict.nav;

  const p = await prisma.project.findUnique({ where: { slug } });
  if (!p) notFound();

  const related = await prisma.project.findMany({
    where: { NOT: { id: p.id }, status: "LIVE" as any },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const pTitle = getTranslatedField(p, "title", lang);
  const pSummary = getTranslatedField(p, "summary", lang);
  const pContent = getTranslatedField(p, "content", lang);

  const dateLocale = lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-US";
  const created = new Date(p.createdAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tags = normalizeTags(p.tags);

  return (
    <main className="min-h-screen">
      {/* ── Hero Section ── */}
      <div className="relative w-full">
        {p.imageUrl ? (
          <div className="relative w-full aspect-[21/9] md:aspect-[24/9]">
            <ImageWithFallback
              src={p.imageUrl}
              alt={pTitle}
              fill
              className="object-cover"
              priority
              unoptimized
              fallbackText={pTitle}
            />
            <div className="detail-hero-gradient" />
          </div>
        ) : (
          <div className="w-full h-32 md:h-48 bg-gradient-to-b from-muted to-background" />
        )}
      </div>

      {/* ── Content Container ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 -mt-16 relative z-10">
        {/* Breadcrumb + Back */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <Breadcrumb
            items={[
              { label: nav.home, href: "/" },
              { label: nav.projects, href: "/projects" },
              { label: pTitle },
            ]}
          />
          <Link
            href="/projects"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {p_text.back_to_list}
          </Link>
        </div>

        {/* ── Project Header Card ── */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-8 animate-fade-in-up">
          {/* Status & Meta Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-4 stagger-children">
            <span
              className={`detail-chip font-semibold ${statusStyle[p.status] ?? "bg-secondary text-muted-foreground"}`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    p.status === "LIVE" ? "bg-emerald-500 animate-ping" : p.status === "UAT" ? "bg-amber-500" : "bg-slate-500"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    p.status === "LIVE" ? "bg-emerald-500" : p.status === "UAT" ? "bg-amber-500" : "bg-slate-500"
                  }`}
                />
              </span>
              {p.status}
            </span>
            <span className="detail-chip">
              <CalendarDays className="h-3.5 w-3.5" />
              {created}
            </span>
            <span className="detail-chip">
              <Globe className="h-3.5 w-3.5" />
              /projects/{p.slug}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3 text-balance leading-tight">
            {pTitle}
          </h1>

          {/* Summary */}
          {pSummary && (
            <p className="text-lg text-muted-foreground max-w-3xl text-pretty leading-relaxed">
              {pSummary}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold dark:border-primary/15 dark:bg-primary/10"
                >
                  <Layers className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Info Cards Grid ── */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8 stagger-children">
          <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
              {p_text.status_label}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  p.status === "LIVE" ? "bg-emerald-500" : p.status === "UAT" ? "bg-amber-500" : "bg-slate-400"
                }`}
              />
              <span className="font-semibold text-foreground">{p.status}</span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
              {p_text.published_label}
            </div>
            <div className="font-semibold text-foreground">{created}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/20 transition-colors">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
              {p_text.url_label}
            </div>
            <div className="font-semibold text-foreground break-all text-sm">/projects/{p.slug}</div>
          </div>
        </div>

        {/* ── Separator ── */}
        {pContent && <div className="hairline-sep !mx-0 !w-full mb-8" />}

        {/* ── Markdown Content ── */}
        {pContent && (
          <section className="prose prose-lg prose-neutral dark:prose-invert prose-detail max-w-none mb-12">
            <ReactMarkdown>{pContent}</ReactMarkdown>
          </section>
        )}

        {/* ── Related Projects ── */}
        {related.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6">{p_text.related_title}</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const rTitle = getTranslatedField(r, "title", lang);
                const rSummary = getTranslatedField(r, "summary", lang);
                return (
                  <Link
                    key={r.id}
                    href={`/projects/${r.slug}`}
                    className="related-card group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    {r.imageUrl ? (
                      <div className="relative w-full aspect-[16/9] overflow-hidden">
                        <ImageWithFallback
                          src={r.imageUrl}
                          alt={rTitle}
                          fill
                          className="object-cover opacity-90"
                          unoptimized
                          fallbackText={rTitle}
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center">
                        <span className="text-3xl text-muted-foreground/20">✦</span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            r.status === "LIVE" ? "bg-emerald-500" : r.status === "UAT" ? "bg-amber-500" : "bg-slate-400"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">{r.status}</span>
                      </div>
                      <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {rTitle}
                      </h4>
                      {rSummary && (
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                          {rSummary}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Bottom CTA ── */}
        <div className="flex flex-wrap items-center gap-3 pb-16">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {p_text.request_quote}
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {p_text.all_projects}
          </Link>
        </div>
      </div>
    </main>
  );
}