/*
  Warnings:

  - You are about to drop the column `city_type` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `date_of_release` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `financial_year` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `fr_first_instalment` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `fr_grant_type` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `fr_interest_amount` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `fr_second_instalment` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `fr_third_instalment` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `total_fund_released` on the `FinancialSummaryReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FinancialSummaryReport" DROP COLUMN "city_type",
DROP COLUMN "date_of_release",
DROP COLUMN "financial_year",
DROP COLUMN "fr_first_instalment",
DROP COLUMN "fr_grant_type",
DROP COLUMN "fr_interest_amount",
DROP COLUMN "fr_second_instalment",
DROP COLUMN "fr_third_instalment",
DROP COLUMN "total_fund_released";
