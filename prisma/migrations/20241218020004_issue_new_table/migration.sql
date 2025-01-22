/*
  Warnings:

  - Made the column `shop_id` on table `issues` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "issues" DROP CONSTRAINT "issues_product_id_fkey";

-- AlterTable
ALTER TABLE "issues" ALTER COLUMN "shop_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "issuesId" INTEGER;

-- CreateIndex
CREATE INDEX "issues_shop_id_index" ON "issues"("shop_id");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_ibfk_1" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_issuesId_fkey" FOREIGN KEY ("issuesId") REFERENCES "issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
