/*
  Warnings:

  - The primary key for the `FinancialSummaryReport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `FinancialSummaryReport` table. All the data in the column will be lost.
  - You are about to drop the column `ulb_id_fk` on the `Scheme_info` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FinancialSummaryReport" DROP CONSTRAINT "FinancialSummaryReport_ulb_id_fkey";

-- DropForeignKey
ALTER TABLE "Scheme_info" DROP CONSTRAINT "Scheme_info_ulb_id_fk_fkey";

-- AlterTable
ALTER TABLE "FinancialSummaryReport" DROP CONSTRAINT "FinancialSummaryReport_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "FinancialSummaryReport_pkey" PRIMARY KEY ("ulb_id");

-- AlterTable
ALTER TABLE "Scheme_info" DROP COLUMN "ulb_id_fk";
