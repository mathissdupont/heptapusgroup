// app/projects/[slug]/page.tsx
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown"; // <-- EKLENDİ

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

const t = {
  border: "border-white/10",
  text: "text-slate-200",
  sub: "text-slate-400",
  chip:
    "inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs/4",
};

const statusStyle: Record<string, string> = {
  LIVE:  "bg-emerald-500/10 text-emerald-300 border-emerald-400/20",
  UAT:   "bg-amber-500/10 text-amber-300 border-amber-400/20",
  DRAFT: "bg-slate-500/10 text-slate-300 border-slate-400/20",
};

// p.tags farklı biçimlerde gelebilir; güvenle string[]'e çevir.
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
  const p = await prisma.project.findUnique({ where: { slug: params.slug } });
  if (!p) notFound();

  const related = await prisma.project.findMany({
    where: { NOT: { id: p.id }, status: p.status },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const created = new Date(p.createdAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const tags = normalizeTags(p.tags);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-slate-200">
      {/* breadcrumb + back */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm text-slate-400">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2 opacity-50">/</span>
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-slate-300">{p.title}</span>
        </div>

        <Link
          href="/projects"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5"
        >
          ← Listeye dön
        </Link>
      </div>

      {/* hero */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-slate-900/20">
        {p.imageUrl ? (
          <div className="relative">
            <img
              src={p.imageUrl}
              alt={p.title}
              className="aspect-[16/7] w-full object-cover opacity-95"
              loading="eager"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
          </div>
        ) : (
          <div className="aspect-[16/7] w-full bg-[radial-gradient(120%_120%_at_50%_0%,#0b1020_0%,#060a12_70%)]" />
        )}

        <div className="p-6 sm:p-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={[
                t.chip,
                statusStyle[p.status] ?? "bg-slate-500/10 text-slate-300",
              ].join(" ")}
              title="Status"
            >
              {p.status}
            </span>

            <span className={`${t.chip} text-slate-300`} title="Created">
              {created}
            </span>

            <span className={`${t.chip} text-slate-300`} title="Slug">
              /{p.slug}
            </span>
          </div>

          <h1 className="text-balance bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
            {p.title}
          </h1>

          {p.summary && (
            <p className="mt-3 max-w-3xl text-pretty text-slate-300">
              {p.summary}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* info grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Durum
          </div>
          <div className="mt-1 font-semibold">
            {p.status}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Yayınlanma
          </div>
          <div className="mt-1 font-semibold">{created}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            URL
          </div>
          <div className="mt-1 font-semibold break-all">/projects/{p.slug}</div>
        </div>
      </div>

      {/* content (Markdown) */}
      {p.content && (
        <section className="prose prose-invert prose-slate mt-8 max-w-none">
          <ReactMarkdown>{p.content}</ReactMarkdown>
        </section>
      )}

      {/* related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-3 text-lg font-semibold text-slate-100">
            Benzer projeler
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/projects/${r.slug}`}
                className="group overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 transition hover:border-white/20"
              >
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    className="aspect-[16/9] w-full object-cover opacity-90 transition group-hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-slate-950" />
                )}
                <div className="p-4">
                  <div className="line-clamp-1 font-semibold text-slate-200">
                    {r.title}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {r.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* footer actions */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/contact"
          className="rounded-lg bg-gradient-to-r from-sky-400 to-violet-400 px-4 py-2 font-semibold text-slate-950 hover:opacity-95"
        >
          Teklif iste
        </Link>
        <Link
          href="/projects"
          className="rounded-lg border border-white/10 px-4 py-2 hover:bg-white/5"
        >
          Tüm projeler
        </Link>
      </div>
    </div>
  );
}
