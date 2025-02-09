/*
  Warnings:

  - A unique constraint covering the columns `[published_link]` on the table `profile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profile_published_link_key" ON "profile"("published_link");
