/*
  Warnings:

  - A unique constraint covering the columns `[ulb_id]` on the table `FinancialSummaryReport` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FinancialSummaryReport_ulb_id_key" ON "FinancialSummaryReport"("ulb_id");
