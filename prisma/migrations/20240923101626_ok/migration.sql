/*
  Warnings:

  - The `date_of_approval` column on the `Scheme_info` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Scheme_info" DROP COLUMN "date_of_approval",
ADD COLUMN     "date_of_approval" TIMESTAMP(3);
