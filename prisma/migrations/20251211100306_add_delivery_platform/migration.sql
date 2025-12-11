-- CreateTable
CREATE TABLE "DeliveryPlatform" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPlatform_name_key" ON "DeliveryPlatform"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryPlatform_slug_key" ON "DeliveryPlatform"("slug");
