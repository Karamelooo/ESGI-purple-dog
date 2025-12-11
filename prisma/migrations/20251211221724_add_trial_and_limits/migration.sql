-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "limits" JSONB,
ADD COLUMN     "trialPeriodDays" INTEGER NOT NULL DEFAULT 0;
