/*
  Warnings:

  - Added the required column `userType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "userType" TEXT NOT NULL,
ALTER COLUMN "userId" SET DATA TYPE TEXT;
