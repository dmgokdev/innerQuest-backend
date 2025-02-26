/*
  Warnings:

  - Made the column `status` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `status` VARCHAR(100) NOT NULL DEFAULT 'ACTIVE';
