/*
  Warnings:

  - A unique constraint covering the columns `[ulb_id,financial_year]` on the table `FundRelease` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FundRelease" ADD COLUMN     "total_fund_released" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Scheme_info" ADD COLUMN     "financial_year" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FundRelease_ulb_id_financial_year_key" ON "FundRelease"("ulb_id", "financial_year");
