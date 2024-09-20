-- AlterTable
ALTER TABLE "Scheme_info" ADD COLUMN     "ulb_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Scheme_info" ADD CONSTRAINT "Scheme_info_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE SET NULL ON UPDATE CASCADE;
