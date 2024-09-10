/*
  Warnings:

  - You are about to drop the column `name` on the `ULB` table. All the data in the column will be lost.
  - Added the required column `ulb_name` to the `ULB` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ULB" DROP CONSTRAINT "ULB_id_fkey";

-- AlterTable
ALTER TABLE "ULB" DROP COLUMN "name",
ADD COLUMN     "ulb_name" TEXT NOT NULL,
ALTER COLUMN "latitude" DROP DEFAULT,
ALTER COLUMN "longitude" DROP DEFAULT;
