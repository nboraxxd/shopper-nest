-- DropIndex
DROP INDEX "Role_deletedAt_idx";

-- CreateIndex
CREATE INDEX "Role_deletedAt_isActive_idx" ON "Role"("deletedAt", "isActive");
