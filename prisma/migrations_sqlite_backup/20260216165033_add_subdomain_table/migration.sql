/*
  Warnings:

  - You are about to alter the column `settings` on the `Subdomain` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subdomain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "themeColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Subdomain" ("createdAt", "description", "id", "isActive", "logoUrl", "name", "settings", "themeColor", "title", "updatedAt") SELECT "createdAt", "description", "id", "isActive", "logoUrl", "name", "settings", "themeColor", "title", "updatedAt" FROM "Subdomain";
DROP TABLE "Subdomain";
ALTER TABLE "new_Subdomain" RENAME TO "Subdomain";
CREATE UNIQUE INDEX "Subdomain_name_key" ON "Subdomain"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
