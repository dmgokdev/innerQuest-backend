/*
  Warnings:

  - You are about to drop the column `business_id` on the `user_answers_logs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `user_answers_logs` DROP FOREIGN KEY `user_answers_logs_business_id_fkey`;

-- AlterTable
ALTER TABLE `bussiness_idea` ADD COLUMN `log_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `user_answers_logs` DROP COLUMN `business_id`;

-- AddForeignKey
ALTER TABLE `bussiness_idea` ADD CONSTRAINT `bussiness_idea_log_id_fkey` FOREIGN KEY (`log_id`) REFERENCES `user_answers_logs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
