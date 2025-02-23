/*
  Warnings:

  - The `status` column on the `payment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'ESCROW', 'RELEASED', 'REFUNDED');

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'ESCROW';

-- CreateTable
CREATE TABLE "interview" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "recruiter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview" ADD CONSTRAINT "interview_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
