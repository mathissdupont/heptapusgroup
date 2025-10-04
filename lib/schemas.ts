import { z } from "zod";

export const ProjectUpsert = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  slug: z.string().min(3),
  summary: z.string().min(10),
  imageUrl: z.string().url().optional(),
  status: z.enum(["LIVE","UAT","DRAFT"]).default("LIVE"),
  tags: z.array(z.string()).default([]),
});
export type ProjectUpsert = z.infer<typeof ProjectUpsert>;
