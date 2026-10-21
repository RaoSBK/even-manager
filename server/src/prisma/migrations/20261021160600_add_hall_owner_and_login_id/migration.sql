-- AlterTable
ALTER TABLE "User" ADD COLUMN     "loginId" TEXT;

-- AlterTable
ALTER TABLE "Hall" ADD COLUMN     "ownerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");

-- CreateIndex
CREATE INDEX "User_loginId_idx" ON "User"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "Hall_ownerId_key" ON "Hall"("ownerId");

-- CreateIndex
CREATE INDEX "Hall_ownerId_idx" ON "Hall"("ownerId");

-- AddForeignKey
ALTER TABLE "Hall" ADD CONSTRAINT "Hall_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
