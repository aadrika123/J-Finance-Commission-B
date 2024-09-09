-- CreateTable
CREATE TABLE "Scheme_info" (
    "schema_id" TEXT NOT NULL,
    "project_cost" DECIMAL(65,30) NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "grant_type" TEXT NOT NULL,
    "city_type" TEXT NOT NULL,
    "date_of_approved" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ulb" TEXT NOT NULL,

    CONSTRAINT "Scheme_info_pkey" PRIMARY KEY ("schema_id")
);
