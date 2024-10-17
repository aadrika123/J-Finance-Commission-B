-- AlterTable
ALTER TABLE "FinancialSummaryReport" ADD COLUMN     "city_type" TEXT,
ADD COLUMN     "date_of_release" TIMESTAMP(3),
ADD COLUMN     "fr_third_instalment" DECIMAL(65,30);
