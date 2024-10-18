-- AlterTable
ALTER TABLE "LetterUpload" ADD COLUMN     "inbox" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "outbox" BOOLEAN NOT NULL DEFAULT false;
