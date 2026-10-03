import { JobType, Prisma } from "@prisma/client";
import { z } from "zod";
import { isSafeUrl } from "@/lib/safe-url";

const slug = z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const safeUrl = z.string().trim().max(500).refine(
  isSafeUrl,
  "Geçerli bir HTTP(S) veya site içi adres girin.",
);
const translations = z.json().refine(
  (value) => JSON.stringify(value).length <= 200_000,
  "Çeviri verisi çok büyük.",
).nullable().optional();

const jobFields = {
  title: z.string().trim().min(1).max(200),
  slug,
  department: optionalText(120),
  location: optionalText(160),
  type: z.nativeEnum(JobType),
  description: z.string().min(1).max(300_000),
  requirements: z.string().max(300_000).nullable().optional(),
  isActive: z.boolean(),
  translations,
};

export const jobCreateSchema = z.object({
  ...jobFields,
  type: z.nativeEnum(JobType).default(JobType.FULL_TIME),
  isActive: z.boolean().default(true),
}).strict();
export const jobUpdateSchema = z.object(jobFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  "Güncellenecek alan bulunamadı.",
);

const faqFields = {
  question: z.string().trim().min(1).max(1000),
  answer: z.string().min(1).max(100_000),
  category: optionalText(100),
  order: z.number().int().min(-10_000).max(10_000),
  isActive: z.boolean(),
  translations,
};

export const faqCreateSchema = z.object({
  ...faqFields,
  order: z.number().int().min(-10_000).max(10_000).default(0),
  isActive: z.boolean().default(true),
}).strict();
export const faqUpdateSchema = z.object(faqFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  "Güncellenecek alan bulunamadı.",
);

const partnerFields = {
  name: z.string().trim().min(1).max(200),
  logoUrl: safeUrl,
  website: safeUrl.or(z.literal("")).nullable().optional(),
  order: z.number().int().min(-10_000).max(10_000),
  isActive: z.boolean(),
};

export const partnerCreateSchema = z.object({
  ...partnerFields,
  order: z.number().int().min(-10_000).max(10_000).default(0),
  isActive: z.boolean().default(true),
}).strict();
export const partnerUpdateSchema = z.object(partnerFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  "Güncellenecek alan bulunamadı.",
);

const dateValue = z.string().max(50).refine((value) => !Number.isNaN(Date.parse(value)), "Geçersiz tarih.");
const announcementFields = {
  message: z.string().trim().min(1).max(2000),
  linkUrl: safeUrl.nullable().optional(),
  linkText: optionalText(200),
  bgColor: z.enum(["violet", "blue", "green", "red", "yellow", "amber", "gray"]),
  isActive: z.boolean(),
  startsAt: dateValue.nullable(),
  endsAt: dateValue.nullable().optional(),
  translations,
};

export const announcementCreateSchema = z.object({
  ...announcementFields,
  bgColor: announcementFields.bgColor.default("violet"),
  isActive: z.boolean().default(true),
  startsAt: dateValue.nullable().optional(),
}).strict();
export const announcementUpdateSchema = z.object(announcementFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  "Güncellenecek alan bulunamadı.",
);

export function inputJson(value: z.infer<typeof translations>) {
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue | undefined;
}
