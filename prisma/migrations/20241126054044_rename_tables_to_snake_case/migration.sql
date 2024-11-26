/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinancialSummaryReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FundRelease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LetterUpload` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Scheme_info` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ULB` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FinancialSummaryReport" DROP CONSTRAINT "FinancialSummaryReport_ulb_id_fkey";

-- DropForeignKey
ALTER TABLE "FundRelease" DROP CONSTRAINT "FundRelease_ulb_id_fkey";

-- DropForeignKey
ALTER TABLE "LetterUpload" DROP CONSTRAINT "LetterUpload_ulb_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_letter_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_ulb_id_fkey";

-- DropForeignKey
ALTER TABLE "Scheme_info" DROP CONSTRAINT "Scheme_info_ulb_id_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "FinancialSummaryReport";

-- DropTable
DROP TABLE "FundRelease";

-- DropTable
DROP TABLE "LetterUpload";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Scheme_info";

-- DropTable
DROP TABLE "ULB";

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action_type" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "changed_data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ulb" (
    "id" SERIAL NOT NULL,
    "ulb_name" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "city_type" TEXT,

    CONSTRAINT "ulb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheme_info" (
    "scheme_id" TEXT NOT NULL,
    "project_cost" DECIMAL(65,30) NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "sector" TEXT,
    "grant_type" TEXT NOT NULL,
    "city_type" TEXT NOT NULL,
    "date_of_approval" TIMESTAMP(3),
    "ulb" TEXT,
    "financial_year" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "project_completion_status" TEXT,
    "tender_floated" TEXT DEFAULT 'no',
    "financial_progress" DECIMAL(65,30),
    "financial_progress_in_percentage" DOUBLE PRECISION,
    "project_completion_status_in_percentage" DOUBLE PRECISION,
    "approved_project_cost" DECIMAL(65,30),
    "ulb_id" INTEGER,

    CONSTRAINT "scheme_info_pkey" PRIMARY KEY ("scheme_id")
);

-- CreateTable
CREATE TABLE "financial_summary_report" (
    "id" SERIAL NOT NULL,
    "ulb_id" INTEGER NOT NULL,
    "ulb_name" TEXT NOT NULL,
    "approved_schemes" INTEGER NOT NULL,
    "fund_release_to_ulbs" DECIMAL(65,30) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "project_completed" INTEGER NOT NULL,
    "expenditure" DECIMAL(65,30) NOT NULL,
    "balance_amount" DECIMAL(65,30) NOT NULL,
    "financial_progress_in_percentage" INTEGER NOT NULL,
    "number_of_tender_floated" INTEGER NOT NULL,
    "tender_not_floated" INTEGER NOT NULL,
    "work_in_progress" INTEGER NOT NULL,
    "project_not_started" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "financial_summary_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letter_upload" (
    "id" SERIAL NOT NULL,
    "ulb_id" INTEGER,
    "order_number" TEXT NOT NULL,
    "letter_url" TEXT NOT NULL,
    "subject" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "inbox" BOOLEAN NOT NULL DEFAULT true,
    "outbox" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "letter_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "ulb_id" INTEGER,
    "letter_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_release" (
    "id" SERIAL NOT NULL,
    "city_type" TEXT NOT NULL,
    "fund_type" TEXT NOT NULL,
    "first_instalment" DOUBLE PRECISION,
    "second_instalment" DOUBLE PRECISION,
    "third_instalment" DOUBLE PRECISION,
    "interest_amount" DOUBLE PRECISION,
    "total_fund_released" DOUBLE PRECISION,
    "financial_year" TEXT NOT NULL,
    "date_of_release" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ulb_id" INTEGER NOT NULL,

    CONSTRAINT "fund_release_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ulb_ulb_name_key" ON "ulb"("ulb_name");

-- CreateIndex
CREATE UNIQUE INDEX "scheme_info_scheme_id_key" ON "scheme_info"("scheme_id");

-- CreateIndex
CREATE UNIQUE INDEX "financial_summary_report_ulb_id_key" ON "financial_summary_report"("ulb_id");

-- CreateIndex
CREATE UNIQUE INDEX "fund_release_ulb_id_financial_year_fund_type_key" ON "fund_release"("ulb_id", "financial_year", "fund_type");

-- AddForeignKey
ALTER TABLE "scheme_info" ADD CONSTRAINT "scheme_info_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ulb"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_summary_report" ADD CONSTRAINT "financial_summary_report_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ulb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "letter_upload" ADD CONSTRAINT "letter_upload_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ulb"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ulb"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "letter_upload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_release" ADD CONSTRAINT "fund_release_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ulb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
