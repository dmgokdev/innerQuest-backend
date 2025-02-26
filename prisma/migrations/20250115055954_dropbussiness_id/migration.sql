/*
  Warnings:

  - You are about to drop the column `bussiness_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_bussiness_id_fkey`;

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `bussiness_id`;
