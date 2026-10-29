ALTER TABLE "Subscriber" ADD COLUMN "consentAt" TIMESTAMP(3), ADD COLUMN "consentVersion" TEXT;
-- Existing subscriptions deliberately retain null evidence; no consent is invented.
