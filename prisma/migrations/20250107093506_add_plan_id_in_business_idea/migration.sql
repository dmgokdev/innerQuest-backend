/*
  Warnings:

  - You are about to drop the column `plan` on the `bussiness_idea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `bussiness_idea` DROP COLUMN `plan`,
    ADD COLUMN `plan_id` INTEGER NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE `bussiness_idea` ADD CONSTRAINT `bussiness_idea_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
