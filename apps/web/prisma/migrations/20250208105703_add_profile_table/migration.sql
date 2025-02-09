-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "years_of_experience" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "skills" TEXT[],
    "interview_rate" DOUBLE PRECISION NOT NULL,
    "interview_rate_currency" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "published_link" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "profile"("user_id");
