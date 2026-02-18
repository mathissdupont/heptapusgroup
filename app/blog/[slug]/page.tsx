import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        ← {nav.blog}
      </Link>

      {post.coverImage && (
        <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-8">
          <Image src={post.coverImage} alt={title} fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="mb-6">
        {post.publishedAt && (
          <time className="text-sm text-muted-foreground">
            {new Date(post.publishedAt).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })}
          </time>
        )}
        {post.author && (
          <span className="text-sm text-muted-foreground ml-3">
            — <span className="text-foreground font-medium">{post.author}</span>
          </span>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{title}</h1>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">
              {tag}
            </span>
          ))}
        </div>
      )}

      <article
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </main>
  );
}
