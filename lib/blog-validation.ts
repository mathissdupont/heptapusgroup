import { BlogStatus, Prisma } from "@prisma/client";
import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().trim().min(1).max(250),
  slug: z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().trim().max(1000).nullable().optional(),
  content: z.string().min(1).max(500_000),
  coverImage: z.string().trim().max(500).nullable().optional(),
  author: z.string().trim().max(100).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  status: z.nativeEnum(BlogStatus).default(BlogStatus.DRAFT),
  translations: z.json().nullable().optional(),
});

export function blogData(input: z.infer<typeof blogSchema>): Prisma.BlogPostCreateInput {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || null,
    content: input.content,
    coverImage: input.coverImage || null,
    author: input.author || null,
    tags: input.tags,
    status: input.status,
    publishedAt: input.status === BlogStatus.PUBLISHED ? new Date() : null,
    translations: input.translations === null
      ? Prisma.JsonNull
      : input.translations as Prisma.InputJsonValue | undefined,
  };
}
