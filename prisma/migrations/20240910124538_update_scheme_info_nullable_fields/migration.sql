-- AlterTable
ALTER TABLE "Scheme_info" ALTER COLUMN "approved_project_cost" DROP NOT NULL,
ALTER COLUMN "approved_project_cost" DROP DEFAULT,
ALTER COLUMN "financial_progress" DROP NOT NULL,
ALTER COLUMN "financial_progress" DROP DEFAULT,
ALTER COLUMN "financial_progress_in_percentage" DROP NOT NULL,
ALTER COLUMN "financial_progress_in_percentage" DROP DEFAULT,
ALTER COLUMN "project_completion_status" DROP NOT NULL,
ALTER COLUMN "project_completion_status" DROP DEFAULT,
ALTER COLUMN "tender_floated" DROP NOT NULL,
ALTER COLUMN "tender_floated" DROP DEFAULT,
ALTER COLUMN "project_completion_status_in_percentage" DROP NOT NULL,
ALTER COLUMN "project_completion_status_in_percentage" DROP DEFAULT;
