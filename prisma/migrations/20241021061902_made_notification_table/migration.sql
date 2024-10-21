-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "ulb_id" INTEGER NOT NULL,
    "letter_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_letter_id_fkey" FOREIGN KEY ("letter_id") REFERENCES "LetterUpload"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
