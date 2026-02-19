import { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Briefcase, Building2, Send } from "lucide-react";
import ApplyForm from "./ApplyForm";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getTranslatedField } from "@/lib/i18n";
import Breadcrumb from "@/components/Breadcrumb";

const dictionaries = getDictionaries();

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getServerLang();
  const job = await prisma.jobPosting.findUnique({ where: { slug } });
  if (!job) return { title: "Position Not Found" };
  const title = getTranslatedField(job, "title", lang);
  return {
    title: `${title} | ${dictionaries[lang].careers_page.title} | Heptapus Group`,
    description: getTranslatedField(job, "description", lang).slice(0, 160),
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getServerLang();
  const t = dictionaries[lang].careers_page;
  const nav = dictionaries[lang].nav;
  const jobTypes = (t as any).job_types as Record<string, string>;

  const job = await prisma.jobPosting.findUnique({ where: { slug } });
  if (!job || !job.isActive) notFound();

  const title = getTranslatedField(job, "title", lang);
  const description = getTranslatedField(job, "description", lang);
  const requirements = getTranslatedField(job, "requirements", lang);

  return (
    <main className="min-h-screen">
      {/* ── Hero Gradient ── */}
      <div className="w-full h-32 md:h-44 bg-gradient-to-b from-primary/5 via-muted/50 to-background" />

      {/* ── Content Container ── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-12 relative z-10">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: nav.home, href: "/" },
            { label: nav.careers, href: "/careers" },
            { label: title },
          ]}
        />

        {/* ── Job Header Card ── */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-5 text-balance leading-tight">
            {title}
          </h1>

          {/* Meta Chips */}
          <div className="flex flex-wrap items-center gap-3 stagger-children">
            {job.department && (
              <span className="detail-chip">
                <Building2 className="h-3.5 w-3.5" />
                {job.department}
              </span>
            )}
            {job.location && (
              <span className="detail-chip">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="detail-chip">
              <Clock className="h-3.5 w-3.5" />
              {jobTypes[job.type] || job.type}
            </span>
          </div>
        </div>

        {/* ── Description Card ── */}
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            {(t as any).description_label}
          </h2>
          <div
            className="prose prose-neutral dark:prose-invert prose-detail max-w-none"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {/* ── Requirements Card ── */}
        {requirements && (
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              {(t as any).requirements_label}
            </h2>
            <div
              className="prose prose-neutral dark:prose-invert prose-detail max-w-none"
              dangerouslySetInnerHTML={{ __html: requirements }}
            />
          </div>
        )}

        {/* ── Apply Form Card ── */}
        <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 sm:p-8 mb-8 relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              {(t as any).apply_position}
            </h2>
            <ApplyForm slug={slug} />
          </div>
        </div>

        {/* ── Bottom Nav ── */}
        <div className="flex flex-wrap items-center gap-3 pb-16">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {(t as any).back}
          </Link>
        </div>
      </div>
    </main>
  );
}
