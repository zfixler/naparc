/*
  Warnings:

  - You are about to drop the column `locationId` on the `Congregation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Congregation" DROP CONSTRAINT "Congregation_denominationSlug_fkey";

-- DropIndex
DROP INDEX "Congregation_locationId_key";

-- AlterTable
ALTER TABLE "Congregation" DROP COLUMN "locationId",
ADD COLUMN     "contact" TEXT,
ALTER COLUMN "pastor" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "website" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "long" DROP NOT NULL,
ALTER COLUMN "lat" DROP NOT NULL,
ALTER COLUMN "denominationSlug" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Presbytery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "denominationSlug" TEXT NOT NULL,

    CONSTRAINT "Presbytery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Presbytery" ADD CONSTRAINT "Presbytery_denominationSlug_fkey" FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Congregation" ADD CONSTRAINT "Congregation_denominationSlug_fkey" FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
