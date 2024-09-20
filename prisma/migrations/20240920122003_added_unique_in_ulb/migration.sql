/*
  Warnings:

  - A unique constraint covering the columns `[ulb_name]` on the table `ULB` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ULB_ulb_name_key" ON "ULB"("ulb_name");
