-- CreateTable
CREATE TABLE "LetterUpload" (
    "id" SERIAL NOT NULL,
    "ulb_id" INTEGER NOT NULL,
    "order_number" TEXT NOT NULL,
    "letter_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LetterUpload_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LetterUpload" ADD CONSTRAINT "LetterUpload_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
