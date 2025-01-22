/*
  Warnings:

  - You are about to drop the column `product_id` on the `issues` table. All the data in the column will be lost.
  - You are about to drop the column `shopify_product_id` on the `issues` table. All the data in the column will be lost.
  - You are about to drop the column `issuesId` on the `product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_issuesId_fkey";

-- DropIndex
DROP INDEX "issues_product_id_key";

-- DropIndex
DROP INDEX "issues_shopify_product_id_key";

-- AlterTable
ALTER TABLE "issues" DROP COLUMN "product_id",
DROP COLUMN "shopify_product_id";

-- AlterTable
ALTER TABLE "product" DROP COLUMN "issuesId";
