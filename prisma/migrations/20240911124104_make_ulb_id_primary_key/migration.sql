/*
  Warnings:

  - You are about to drop the column `first_instalment` on the `FinancialSummaryReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FinancialSummaryReport" DROP COLUMN "first_instalment",
ALTER COLUMN "financial_year" DROP NOT NULL,
ALTER COLUMN "second_instalment" DROP NOT NULL,
ALTER COLUMN "interest_amount" DROP NOT NULL,
ALTER COLUMN "grant_type" DROP NOT NULL;
