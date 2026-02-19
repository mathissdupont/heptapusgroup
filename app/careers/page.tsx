import { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import Link from "next/link";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getTranslatedField } from "@/lib/i18n";

const dictionaries = getDictionaries();

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = dictionaries[lang].careers_page;
  return {
    title: t.meta_title,
    description: t.subtitle,
    openGraph: { title: t.meta_title, description: t.subtitle, type: "website" },
  };
}

export default async function CareersPage() {
  const lang = await getServerLang();
  const t = dictionaries[lang].careers_page;
  const jobTypes = (t as any).job_types as Record<string, string>;

  const jobs = await prisma.jobPosting.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-foreground mb-3">{t.title}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t.subtitle}</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{t.no_jobs}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {(t as any).send_cv}{" "}
            <a href="mailto:careers@heptapusgroup.com" className="text-foreground font-medium hover:underline">careers@heptapusgroup.com</a>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const title = getTranslatedField(job, "title", lang);
            return (
              <Link
                key={job.id}
                href={`/careers/${job.slug}`}
                className="block rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-foreground text-lg">{title}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {jobTypes[job.type] || job.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {(t as any).view_details}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
