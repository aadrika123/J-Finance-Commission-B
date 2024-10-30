/*
  Warnings:

  - A unique constraint covering the columns `[ulb_id,financial_year,fund_type]` on the table `FundRelease` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FundRelease_ulb_id_financial_year_key";

-- CreateIndex
CREATE UNIQUE INDEX "FundRelease_ulb_id_financial_year_fund_type_key" ON "FundRelease"("ulb_id", "financial_year", "fund_type");
