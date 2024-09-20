/*
  Warnings:

  - You are about to drop the column `ulb` on the `Scheme_info` table. All the data in the column will be lost.
  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ulb_id_fk]` on the table `FinancialSummaryReport` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FinancialSummaryReport" ADD COLUMN     "ulb_id_fk" INTEGER;

-- AlterTable
ALTER TABLE "Scheme_info" DROP COLUMN "ulb",
ADD COLUMN     "ulb_id" INTEGER;

-- DropTable
DROP TABLE "Resource";

-- CreateIndex
CREATE UNIQUE INDEX "FinancialSummaryReport_ulb_id_fk_key" ON "FinancialSummaryReport"("ulb_id_fk");

-- AddForeignKey
ALTER TABLE "Scheme_info" ADD CONSTRAINT "Scheme_info_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialSummaryReport" ADD CONSTRAINT "FinancialSummaryReport_ulb_id_fk_fkey" FOREIGN KEY ("ulb_id_fk") REFERENCES "ULB"("id") ON DELETE SET NULL ON UPDATE CASCADE;
