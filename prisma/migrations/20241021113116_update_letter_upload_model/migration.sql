-- DropForeignKey
ALTER TABLE "LetterUpload" DROP CONSTRAINT "LetterUpload_ulb_id_fkey";

-- AlterTable
ALTER TABLE "LetterUpload" ALTER COLUMN "ulb_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LetterUpload" ADD CONSTRAINT "LetterUpload_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE SET NULL ON UPDATE CASCADE;
