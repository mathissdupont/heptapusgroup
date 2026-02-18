-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN "translations" JSONB;

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "translations" JSONB;

-- AlterTable
ALTER TABLE "FaqItem" ADD COLUMN "translations" JSONB;

-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN "translations" JSONB;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "translations" JSONB;

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN "translations" JSONB;
