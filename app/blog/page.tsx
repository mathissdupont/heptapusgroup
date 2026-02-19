import { Metadata } from "next";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";
import { getTranslatedField } from "@/lib/i18n";

const dictionaries = getDictionaries();

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  const t = dictionaries[lang].blog_page;
  return {
    title: t.meta_title,
    description: t.subtitle,
    openGraph: { title: t.meta_title, description: t.subtitle, type: "website" },
  };
}

export default async function BlogListPage() {
  const lang = await getServerLang();
  const t = dictionaries[lang].blog_page;

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const dateLocale = lang === "tr" ? "tr-TR" : lang === "de" ? "de-DE" : "en-US";

  return (
    <main className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-foreground mb-3">{t.title}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t.subtitle}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 border border-dashed border-border rounded-xl">
          {t.no_posts}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const title = getTranslatedField(post, "title", lang);
            const excerpt = getTranslatedField(post, "excerpt", lang);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                {post.coverImage ? (
                  <div className="relative w-full aspect-[16/9] bg-muted">
                    <ImageWithFallback src={post.coverImage} alt={title} fill className="object-cover" unoptimized fallbackText={title} />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground/30">✦</span>
                  </div>
                )}
                <div className="p-5">
                  {post.publishedAt && (
                    <time className="text-xs text-muted-foreground mb-2 block">
                      {new Date(post.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })}
                    </time>
                  )}
                  <h2 className="font-semibold text-foreground mb-2 group-hover:text-foreground/70 transition-colors line-clamp-2">
                    {title}
                  </h2>
                  {excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
