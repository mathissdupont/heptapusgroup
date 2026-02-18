import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getTranslatedField } from "@/lib/i18n";

const dictionaries = getDictionaries();

type Props = { params: { slug: string } };

const getLang = getServerLang;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = await getServerLang();
  const p = await prisma.project.findUnique({ where: { slug: params.slug } });
  if (!p) return { title: "Project Not Found" };

  const title = getTranslatedField(p, "title", lang);
  const summary = getTranslatedField(p, "summary", lang);

  return {
    title: `${title} | Heptapus`,
    description: summary || "Project details",
  };
}

const t_styles = {
  border: "border-border",
  text: "text-foreground",
  sub: "text-muted-foreground",
  chip: "inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs/4",
};

const statusStyle: Record<string, string> = {
  LIVE:  "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  UAT:   "bg-amber-500/10 text-amber-300 border-amber-400/20",
  DRAFT: "bg-slate-500/10 text-slate-300 border-slate-400/20",
};

function normalizeTags(src: unknown): string[] {
  if (Array.isArray(src)) return (src as any[]).map(String).filter(Boolean);
  if (typeof src === "string") {
    try {
      const parsed = JSON.parse(src);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return src.split(",").map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export default async function ProjectDetail({ params }: Props) {
  const lang = await getLang();
  const dict = dictionaries[lang];
  const p_text = dict.project_detail;
  const nav = dict.nav;

  const p = await prisma.project.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();

  const related = await prisma.project.findMany({
    where: { NOT: { id: p.id }, status: p.status },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const pTitle = getTranslatedField(p, "title", lang);
  const pSummary = getTranslatedField(p, "summary", lang);
  const pContent = getTranslatedField(p, "content", lang);

  // Tarih formatını dile göre ayarla
  const dateLocale = lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-US";
  const created = new Date(p.createdAt).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const tags = normalizeTags(p.tags);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-foreground">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Breadcrumb items={[
          { label: nav.home, href: "/" },
          { label: nav.projects, href: "/projects" },
          { label: pTitle },
        ]} />

        <Link
          href="/projects"
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-secondary"
        >
          {p_text.back_to_list}
        </Link>
      </div>

      {/* hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {p.imageUrl ? (
          <div className="relative">
            <img src={p.imageUrl} alt={pTitle} className="aspect-[16/7] w-full object-cover opacity-95" loading="eager" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
          </div>
        ) : (
          <div className="aspect-[16/7] w-full bg-muted" />
        )}

        <div className="p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={[t_styles.chip, statusStyle[p.status] ?? "bg-secondary text-muted-foreground"].join(" ")}>
              {p.status}
            </span>
            <span className={`${t_styles.chip} text-muted-foreground`}>{created}</span>
            <span className={`${t_styles.chip} text-muted-foreground`}>/{p.slug}</span>
          </div>

          <h1 className="text-balance text-3xl font-extrabold text-foreground sm:text-4xl">
            {pTitle}
          </h1>

          {pSummary && <p className="mt-3 max-w-3xl text-pretty text-muted-foreground">{pSummary}</p>}

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span key={`${tag}-${i}`} className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{p_text.status_label}</div>
          <div className="mt-1 font-semibold text-card-foreground">{p.status}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{p_text.published_label}</div>
          <div className="mt-1 font-semibold text-card-foreground">{created}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{p_text.url_label}</div>
          <div className="mt-1 font-semibold text-card-foreground break-all">/projects/{p.slug}</div>
        </div>
      </div>

      {pContent && (
        <section className="prose dark:prose-invert mt-8 max-w-none">
          <ReactMarkdown>{pContent}</ReactMarkdown>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-3 text-lg font-semibold text-foreground">{p_text.related_title}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/projects/${r.slug}`} className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/30">
                {r.imageUrl ? (
                  <img src={r.imageUrl} alt={getTranslatedField(r, "title", lang)} className="aspect-[16/9] w-full object-cover opacity-90 transition group-hover:opacity-100" />
                ) : (
                  <div className="aspect-[16/9] w-full bg-muted" />
                )}
                <div className="p-4">
                  <div className="line-clamp-1 font-semibold text-card-foreground">{getTranslatedField(r, "title", lang)}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{getTranslatedField(r, "summary", lang)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link href="/contact" className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90">
          {p_text.request_quote}
        </Link>
        <Link href="/projects" className="rounded-lg border border-border px-4 py-2 hover:bg-secondary">
          {p_text.all_projects}
        </Link>
      </div>
    </div>
  );
}