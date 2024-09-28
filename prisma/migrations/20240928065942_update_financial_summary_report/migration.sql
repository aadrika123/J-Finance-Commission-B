/*
  Warnings:

  - You are about to drop the column `first_instalment` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `grant_type` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `interest_amount` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `second_instalment` on the `FinancialSummaryReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FinancialSummaryReport" DROP COLUMN "first_instalment",
DROP COLUMN "grant_type",
DROP COLUMN "interest_amount",
DROP COLUMN "second_instalment",
ADD COLUMN     "fr_first_instalment" DECIMAL(65,30),
ADD COLUMN     "fr_grant_type" TEXT,
ADD COLUMN     "fr_interest_amount" DECIMAL(65,30),
ADD COLUMN     "fr_second_instalment" DECIMAL(65,30),
ADD COLUMN     "project_not_started" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3);
