-- CreateTable
CREATE TABLE "Denomination" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Denomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presbytery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "denominationSlug" TEXT NOT NULL,

    CONSTRAINT "Presbytery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Congregation" (
    "id" TEXT NOT NULL,
    "pastor" TEXT,
    "name" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "addressLabel" TEXT,
    "contact" TEXT,
    "lon" DOUBLE PRECISION,
    "lat" DOUBLE PRECISION,
    "presbyteryId" TEXT,
    "denominationSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Congregation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Denomination_slug_key" ON "Denomination"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Presbytery_denominationSlug_slug_key" ON "Presbytery"("denominationSlug", "slug");

-- AddForeignKey
ALTER TABLE "Presbytery" ADD CONSTRAINT "Presbytery_denominationSlug_fkey" FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Congregation" ADD CONSTRAINT "Congregation_presbyteryId_fkey" FOREIGN KEY ("presbyteryId") REFERENCES "Presbytery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Congregation" ADD CONSTRAINT "Congregation_denominationSlug_fkey" FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add extensions
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
