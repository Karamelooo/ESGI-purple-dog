-- DropIndex
DROP INDEX "DeliveryPlatform_name_key";

-- AlterTable
ALTER TABLE "DeliveryPlatform" ADD COLUMN     "config" JSONB,
ALTER COLUMN "isActive" SET DEFAULT false;
