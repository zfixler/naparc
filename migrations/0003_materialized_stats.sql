CREATE TABLE "HomeStats" (
    "id" INTEGER NOT NULL PRIMARY KEY CHECK ("id" = 1),
    "totalCongregations" INTEGER NOT NULL,
    "totalDenominations" INTEGER NOT NULL,
    "totalStates" INTEGER NOT NULL,
    "totalProvinces" INTEGER NOT NULL,
    "updatedAt" TEXT NOT NULL
);

ALTER TABLE "Presbytery" ADD COLUMN "congregationCount" INTEGER NOT NULL DEFAULT 0;

-- This is a one-time migration cost. Subsequent request handlers read the stored
-- count instead of scanning every congregation in a presbytery.
UPDATE "Presbytery"
SET "congregationCount" = (
    SELECT COUNT(*) FROM "Congregation" c WHERE c."presbyteryId" = "Presbytery"."id"
);
