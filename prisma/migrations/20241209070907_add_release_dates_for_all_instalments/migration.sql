/*
  Warnings:

  - You are about to drop the column `date_of_release` on the `fund_release` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fund_release" DROP COLUMN "date_of_release",
ADD COLUMN     "date_of_release_first" TIMESTAMP(3),
ADD COLUMN     "date_of_release_incentive" TIMESTAMP(3),
ADD COLUMN     "date_of_release_interest" TIMESTAMP(3),
ADD COLUMN     "date_of_release_second" TIMESTAMP(3),
ADD COLUMN     "date_of_release_third" TIMESTAMP(3);
