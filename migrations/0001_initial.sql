PRAGMA foreign_keys = ON;

CREATE TABLE "Denomination" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "continental" INTEGER NOT NULL DEFAULT 0 CHECK ("continental" IN (0, 1)),
    "description" TEXT
);

CREATE TABLE "Presbytery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "denominationSlug" TEXT NOT NULL,
    FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE ("denominationSlug", "slug")
);

CREATE TABLE "Congregation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pastor" TEXT,
    "name" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "addressLabel" TEXT,
    "contact" TEXT,
    "lon" REAL,
    "lat" REAL,
    "presbyteryId" TEXT,
    "denominationSlug" TEXT NOT NULL,
    "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TEXT,
    FOREIGN KEY ("presbyteryId") REFERENCES "Presbytery"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT,
    "denominationSlug" TEXT NOT NULL UNIQUE,
    "completedAt" TEXT,
    "attemptedAt" TEXT,
    "count" INTEGER,
    FOREIGN KEY ("denominationSlug") REFERENCES "Denomination"("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Presbytery_denominationSlug_idx" ON "Presbytery"("denominationSlug");
CREATE INDEX "Congregation_denominationSlug_idx" ON "Congregation"("denominationSlug");
CREATE INDEX "Congregation_presbyteryId_idx" ON "Congregation"("presbyteryId");
CREATE INDEX "Congregation_coordinates_idx" ON "Congregation"("lat", "lon");
