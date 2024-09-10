-- AlterTable
CREATE SEQUENCE ulb_id_seq;
ALTER TABLE "ULB" ALTER COLUMN "id" SET DEFAULT nextval('ulb_id_seq');
ALTER SEQUENCE ulb_id_seq OWNED BY "ULB"."id";
