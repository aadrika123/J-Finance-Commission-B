-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_ulb_id_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "ulb_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE SET NULL ON UPDATE CASCADE;
