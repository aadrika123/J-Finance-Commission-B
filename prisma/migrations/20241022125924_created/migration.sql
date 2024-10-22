-- CreateTable
CREATE TABLE "FundRelease" (
    "id" SERIAL NOT NULL,
    "city_type" TEXT NOT NULL,
    "fund_type" TEXT NOT NULL,
    "first_instalment" DOUBLE PRECISION,
    "second_instalment" DOUBLE PRECISION,
    "third_instalment" DOUBLE PRECISION,
    "interest_amount" DOUBLE PRECISION,
    "financial_year" TEXT NOT NULL,
    "date_of_release" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ulb_id" INTEGER NOT NULL,

    CONSTRAINT "FundRelease_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FundRelease" ADD CONSTRAINT "FundRelease_ulb_id_fkey" FOREIGN KEY ("ulb_id") REFERENCES "ULB"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
