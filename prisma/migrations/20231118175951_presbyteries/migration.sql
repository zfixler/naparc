/*
  Warnings:

  - You are about to drop the column `denominationSlug` on the `Congregation` table. All the data in the column will be lost.
  - Added the required column `presbyteryId` to the `Congregation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Congregation" DROP CONSTRAINT "Congregation_denominationSlug_fkey";

-- AlterTable
ALTER TABLE "Congregation" DROP COLUMN "denominationSlug",
ADD COLUMN     "presbyteryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Congregation" ADD CONSTRAINT "Congregation_presbyteryId_fkey" FOREIGN KEY ("presbyteryId") REFERENCES "Presbytery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
