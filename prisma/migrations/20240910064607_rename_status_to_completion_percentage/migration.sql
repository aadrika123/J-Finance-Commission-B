/*
  Warnings:

  - You are about to drop the column `status` on the `Scheme_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Scheme_info" DROP COLUMN "status",
ADD COLUMN     "project_completion_status_in_percentage" INTEGER NOT NULL DEFAULT 0;
