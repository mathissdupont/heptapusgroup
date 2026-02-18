import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Briefcase } from "lucide-react";
import ApplyForm from "./ApplyForm";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getTranslatedField } from "@/lib/i18n";

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
  const jobTypes = (t as any).job_types as Record<string, string>;

  const job = await prisma.jobPosting.findUnique({ where: { slug } });
  if (!job || !job.isActive) notFound();

  const title = getTranslatedField(job, "title", lang);
  const description = getTranslatedField(job, "description", lang);
  const requirements = getTranslatedField(job, "requirements", lang);

  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <Link href="/careers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {(t as any).back}
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-4">{title}</h1>

      <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
        {job.department && (
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            {job.department}
          </span>
        )}
        {job.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.location}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {jobTypes[job.type] || job.type}
        </span>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
        <h2>{(t as any).description_label}</h2>
        <div dangerouslySetInnerHTML={{ __html: description }} />
      </div>

      {requirements && (
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <h2>{(t as any).requirements_label}</h2>
          <div dangerouslySetInnerHTML={{ __html: requirements }} />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-xl font-bold text-foreground mb-6">{(t as any).apply_position}</h2>
        <ApplyForm slug={slug} />
      </div>
    </main>
  );
}
