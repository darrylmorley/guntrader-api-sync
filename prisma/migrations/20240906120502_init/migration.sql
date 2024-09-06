-- CreateTable
CREATE TABLE "Gun" (
    "id" TEXT NOT NULL,
    "guntrader_id" TEXT NOT NULL,
    "is_new" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "certification_type" TEXT NOT NULL,
    "mechanism" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "model2" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "calibre" TEXT NOT NULL,
    "stock_number" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "year_of_manufacture" INTEGER,
    "country_of_origin" TEXT,
    "guntrader_url" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "guntrader_id" TEXT NOT NULL,
    "gun_id" TEXT NOT NULL,
    "guntrader_gun_id" TEXT NOT NULL,
    "small_url" TEXT,
    "medium_url" TEXT,
    "large_url" TEXT,
    "original_url" TEXT,
    "is_primary" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gun_guntrader_id_key" ON "Gun"("guntrader_id");

-- CreateIndex
CREATE UNIQUE INDEX "Gun_stock_number_key" ON "Gun"("stock_number");

-- CreateIndex
CREATE UNIQUE INDEX "Image_guntrader_id_key" ON "Image"("guntrader_id");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_gun_id_fkey" FOREIGN KEY ("gun_id") REFERENCES "Gun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
