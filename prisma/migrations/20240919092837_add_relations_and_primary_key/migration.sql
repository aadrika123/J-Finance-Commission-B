/*
  Warnings:

  - The primary key for the `FinancialSummaryReport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ulb_id_fk` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `ulb_id` on the `Scheme_info` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FinancialSummaryReport" DROP CONSTRAINT "FinancialSummaryReport_ulb_id_fk_fkey";

-- DropForeignKey
ALTER TABLE "Scheme_info" DROP CONSTRAINT "Scheme_info_ulb_id_fkey";

-- DropIndex
DROP INDEX "FinancialSummaryReport_ulb_id_fk_key";

-- AlterTable
ALTER TABLE "FinancialSummaryReport" DROP CONSTRAINT "FinancialSummaryReport_pkey",
DROP COLUMN "ulb_id_fk",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FinancialSummaryReport_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Scheme_info" DROP COLUMN "ulb_id",
ADD COLUMN     "ulb" TEXT,
ADD COLUMN     "ulb_id_fk" INTEGER;

-- AddForeignKey
ALTER TABLE "Scheme_info" ADD CONSTRAINT "Scheme_info_ulb_id_fk_fkey" FOREIGN KEY ("ulb_id_fk") REFERENCES "ULB"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialSummaryReport" ADD CONSTRAINT "FinancialSummaryReport_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
