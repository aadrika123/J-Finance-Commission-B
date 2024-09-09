/*
  Warnings:

  - A unique constraint covering the columns `[scheme_id]` on the table `Scheme_info` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Scheme_info" ADD COLUMN     "approved_project_cost" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "financial_progress" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "financial_progress_in_percentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "project_completion_status" TEXT NOT NULL DEFAULT 'no',
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tender_floated" TEXT NOT NULL DEFAULT 'no';

-- CreateIndex
CREATE UNIQUE INDEX "Scheme_info_scheme_id_key" ON "Scheme_info"("scheme_id");
