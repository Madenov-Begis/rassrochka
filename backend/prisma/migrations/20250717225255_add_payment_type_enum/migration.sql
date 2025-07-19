/*
  Warnings:

  - The values [payment_overdue,blocked] on the enum `StoreStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ordinary', 'early_payoff');

-- AlterEnum
BEGIN;
CREATE TYPE "StoreStatus_new" AS ENUM ('active', 'inactive');
ALTER TABLE "stores" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "stores" ALTER COLUMN "status" TYPE "StoreStatus_new" USING ("status"::text::"StoreStatus_new");
ALTER TYPE "StoreStatus" RENAME TO "StoreStatus_old";
ALTER TYPE "StoreStatus_new" RENAME TO "StoreStatus";
DROP TYPE "StoreStatus_old";
ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'ordinary';
