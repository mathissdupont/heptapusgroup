-- Some existing installations have a password column added by the certificate
-- service. This site's credentials are stored in passwordHash. Preserve all
-- legacy values; allow accounts created by this site to omit the legacy field.
-- Fresh installations do not have this column and require no change.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'User' AND column_name = 'password'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
  END IF;
END $$;
