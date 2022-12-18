/*
  Warnings:

  - You are about to alter the column `expiration` on the `Cooldown` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cooldown" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiration" BIGINT NOT NULL
);
INSERT INTO "new_Cooldown" ("expiration", "id") SELECT "expiration", "id" FROM "Cooldown";
DROP TABLE "Cooldown";
ALTER TABLE "new_Cooldown" RENAME TO "Cooldown";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
