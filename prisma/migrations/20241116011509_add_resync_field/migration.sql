/*
  Warnings:

  - Added the required column `needResync` to the `shops` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "needResync" BOOLEAN NOT NULL;
