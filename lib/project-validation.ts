import { Prisma, Status } from "@prisma/client";
import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  summary: z.string().trim().min(1).max(2000),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  status: z.nativeEnum(Status).default(Status.DRAFT),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  content: z.string().max(200_000).nullable().optional(),
  translations: z.json().nullable().optional(),
});

export function projectData(input: z.infer<typeof projectSchema>): Prisma.ProjectCreateInput {
  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    imageUrl: input.imageUrl || null,
    status: input.status,
    tags: input.tags,
    content: input.content || null,
    translations: input.translations === null
      ? Prisma.JsonNull
      : input.translations as Prisma.InputJsonValue | undefined,
  };
}
