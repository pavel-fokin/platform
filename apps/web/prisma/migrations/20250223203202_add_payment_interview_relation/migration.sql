/*
  Warnings:

  - You are about to drop the column `status` on the `interview` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[interview_id]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `interview_id` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "interview" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "user_id",
ADD COLUMN     "interview_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payment_interview_id_key" ON "payment"("interview_id");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
