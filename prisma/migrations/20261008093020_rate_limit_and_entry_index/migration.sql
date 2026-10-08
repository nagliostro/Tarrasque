-- DropIndex
DROP INDEX "CollectionEntry_userId_kind_idx";

-- CreateTable
CREATE TABLE "rate_limit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "CollectionEntry_userId_kind_createdAt_idx" ON "CollectionEntry"("userId", "kind", "createdAt");
