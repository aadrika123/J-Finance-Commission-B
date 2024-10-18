/*
  Warnings:

  - You are about to drop the column `not_allocated_fund` on the `FinancialSummaryReport` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FinancialSummaryReport" DROP COLUMN "not_allocated_fund",
ADD COLUMN     "total_fund_released" DECIMAL(65,30);
