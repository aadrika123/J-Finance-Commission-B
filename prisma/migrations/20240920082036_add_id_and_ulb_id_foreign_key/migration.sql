/*
  Warnings:

  - The primary key for the `FinancialSummaryReport` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "FinancialSummaryReport" DROP CONSTRAINT "FinancialSummaryReport_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FinancialSummaryReport_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "FinancialSummaryReport" ADD CONSTRAINT "FinancialSummaryReport_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
