-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "reservedById" INTEGER,
ADD COLUMN     "reservedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCustomerId" TEXT;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_reservedById_fkey" FOREIGN KEY ("reservedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
