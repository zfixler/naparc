-- Cover the filtering and ordering used by congregation listing pages so D1 can
-- return one page directly from the index instead of sorting the full snapshot.
CREATE INDEX "Congregation_denominationSlug_name_idx"
ON "Congregation"("denominationSlug", "name");

CREATE INDEX "Congregation_presbyteryId_name_idx"
ON "Congregation"("presbyteryId", "name");
