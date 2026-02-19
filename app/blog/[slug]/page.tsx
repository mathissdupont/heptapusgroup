import { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { ArrowLeft, Calendar, User, Clock, Tag, BookOpen } from "lucide-react";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getTranslatedField } from "@/lib/i18n";
import Breadcrumb from "@/components/Breadcrumb";

const dictionaries = getDictionaries();

interface Props {
  params: Promise<{ slug: string }>;
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getServerLang();
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Post Not Found" };
  const title = getTranslatedField(post, "title", lang);
  const excerpt = getTranslatedField(post, "excerpt", lang) || title;
  return {
    title: `${title} | Heptapus Group Blog`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      type: "article",
      ...(post.coverImage && { images: [post.coverImage] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const lang = await getServerLang();
  const t = dictionaries[lang].blog_page;
  const nav = dictionaries[lang].nav;

  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || (post.status !== "PUBLISHED" && !post.publishedAt)) notFound();

  const title = getTranslatedField(post, "title", lang);
  const excerpt = getTranslatedField(post, "excerpt", lang);
  const content = getTranslatedField(post, "content", lang);
  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const dateLocale = lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-US";
  const readingTime = estimateReadingTime(content);

  /* --- Related posts: same tags first, then latest --- */
  const relatedWhere: any = {
    NOT: { id: post.id },
    status: "PUBLISHED" as const,
    publishedAt: { lte: new Date() },
  };
  let related = await prisma.blogPost.findMany({
    where: relatedWhere,
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <main className="min-h-screen">
      {/* ── Hero Section ── */}
      <div className="relative w-full">
        {post.coverImage ? (
          <div className="relative w-full aspect-[21/9] md:aspect-[24/9]">
            <Image
              src={post.coverImage}
              alt={title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="detail-hero-gradient" />
          </div>
        ) : (
          <div className="w-full h-32 md:h-48 bg-gradient-to-b from-muted to-background" />
        )}
      </div>

      {/* ── Content Container ── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 -mt-16 relative z-10">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: nav.home, href: "/" },
            { label: nav.blog, href: "/blog" },
            { label: title },
          ]}
        />

        {/* ── Meta Chips ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6 stagger-children">
          {post.publishedAt && (
            <span className="detail-chip">
              <Calendar className="h-3.5 w-3.5" />
              <time>
                {new Date(post.publishedAt).toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </span>
          )}
          {post.author && (
            <span className="detail-chip">
              <User className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{post.author}</span>
            </span>
          )}
          <span className="detail-chip">
            <Clock className="h-3.5 w-3.5" />
            {(t as any).reading_time?.replace("{min}", String(readingTime)) ?? `${readingTime} min`}
          </span>
        </div>

        {/* ── Title ── */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 text-balance leading-tight animate-fade-in-up">
          {title}
        </h1>

        {/* ── Excerpt ── */}
        {excerpt && (
          <p className="text-lg text-muted-foreground mb-6 text-pretty leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* ── Tags ── */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold dark:border-primary/15 dark:bg-primary/10"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Separator ── */}
        <div className="hairline-sep !mx-0 !w-full mb-10" />

        {/* ── Article Body ── */}
        <article
          className="prose prose-lg prose-neutral dark:prose-invert prose-detail max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* ── Author Card ── */}
        {post.author && (
          <div className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card mb-12">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
                {(t as any).written_by}
              </p>
              <p className="font-semibold text-foreground">{post.author}</p>
            </div>
          </div>
        )}

        {/* ── Related Posts ── */}
        {related.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              {(t as any).related_posts}
            </h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const rTitle = getTranslatedField(r, "title", lang);
                const rExcerpt = getTranslatedField(r, "excerpt", lang);
                return (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="related-card group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    {r.coverImage ? (
                      <div className="relative w-full aspect-[16/9] overflow-hidden">
                        <ImageWithFallback
                          src={r.coverImage}
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
                      {r.publishedAt && (
                        <time className="text-xs text-muted-foreground mb-1.5 block">
                          {new Date(r.publishedAt).toLocaleDateString(dateLocale, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      )}
                      <h4 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {rTitle}
                      </h4>
                      {rExcerpt && (
                        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                          {rExcerpt}
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
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {(t as any).all_posts}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {(t as any).subscribe_cta}
          </Link>
        </div>
      </div>
    </main>
  );
}
