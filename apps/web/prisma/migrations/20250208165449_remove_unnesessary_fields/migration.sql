/*
  Warnings:

  - You are about to drop the column `bio` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profile" DROP COLUMN "bio",
DROP COLUMN "skills";
