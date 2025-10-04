/*
  Warnings:

  - You are about to drop the column `ip` on the `ContactMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `ContactMessage` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ContactMessage" ("createdAt", "email", "id", "message", "name", "subject") SELECT "createdAt", "email", "id", "message", "name", "subject" FROM "ContactMessage";
DROP TABLE "ContactMessage";
ALTER TABLE "new_ContactMessage" RENAME TO "ContactMessage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
