-- AlterTable
ALTER TABLE "installments" ADD COLUMN     "managerId" INTEGER;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
