/*
  Warnings:

  - You are about to drop the column `action` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `AuditLog` table. All the data in the column will be lost.
  - Added the required column `actionType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordId` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tableName` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "action",
DROP COLUMN "details",
DROP COLUMN "ipAddress",
ADD COLUMN     "actionType" TEXT NOT NULL,
ADD COLUMN     "changedData" JSONB,
ADD COLUMN     "recordId" TEXT NOT NULL,
ADD COLUMN     "tableName" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;
