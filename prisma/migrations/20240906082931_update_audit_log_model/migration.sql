/*
  Warnings:

  - You are about to drop the column `userType` on the `AuditLog` table. All the data in the column will be lost.
  - Changed the type of `userId` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "userType",
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;
