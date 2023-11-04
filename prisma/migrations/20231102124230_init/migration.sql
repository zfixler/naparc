-- CreateTable
CREATE TABLE "Denomination" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,

    CONSTRAINT "Denomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Congregation" (
    "id" TEXT NOT NULL,
    "pastor" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "long" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "denominationSlug" TEXT NOT NULL,

    CONSTRAINT "Congregation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Denomination_slug_key" ON "Denomination"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Congregation_locationId_key" ON "Congregation"("locationId");

-- AddForeignKey
ALTER TABLE "Congregation" ADD CONSTRAINT "Congregation_denominationSlug_fkey" FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
