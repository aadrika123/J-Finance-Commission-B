/*
  Warnings:

  - You are about to drop the column `date_of_approved` on the `Scheme_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Scheme_info" DROP COLUMN "date_of_approved",
ADD COLUMN     "date_of_approval" TIMESTAMP(3);
