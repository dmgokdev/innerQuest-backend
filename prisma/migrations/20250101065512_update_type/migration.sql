/*
  Warnings:

  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Float`.

*/
-- AlterTable
ALTER TABLE `payments` MODIFY `amount` FLOAT NULL;
