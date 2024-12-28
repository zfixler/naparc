-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "denominationSlug" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "attemptedAt" TIMESTAMP(3),
    "count" INTEGER,

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeLog_denominationSlug_key" ON "ScrapeLog"("denominationSlug");

-- AddForeignKey
ALTER TABLE "ScrapeLog" ADD CONSTRAINT "ScrapeLog_denominationSlug_fkey" FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
