-- CreateTable
CREATE TABLE "FinancialSummaryReport" (
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
    "financial_year" INTEGER NOT NULL,
    "first_instalment" DECIMAL(65,30) NOT NULL,
    "second_instalment" DECIMAL(65,30) NOT NULL,
    "interest_amount" DECIMAL(65,30) NOT NULL,
    "grant_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialSummaryReport_pkey" PRIMARY KEY ("ulb_id")
);
