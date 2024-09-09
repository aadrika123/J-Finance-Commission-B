/*
  Warnings:

  - The primary key for the `Scheme_info` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `schema_id` on the `Scheme_info` table. All the data in the column will be lost.
  - Added the required column `scheme_id` to the `Scheme_info` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Scheme_info" DROP CONSTRAINT "Scheme_info_pkey",
DROP COLUMN "schema_id",
ADD COLUMN     "scheme_id" TEXT NOT NULL,
ADD CONSTRAINT "Scheme_info_pkey" PRIMARY KEY ("scheme_id");
