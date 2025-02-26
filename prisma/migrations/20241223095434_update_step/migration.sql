/*
  Warnings:

  - You are about to drop the column `steps_id` on the `questions` table. All the data in the column will be lost.
  - Added the required column `step_id` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `questions` DROP FOREIGN KEY `questions_steps_id_fkey`;

-- AlterTable
ALTER TABLE `questions` DROP COLUMN `steps_id`,
    ADD COLUMN `step_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_step_id_fkey` FOREIGN KEY (`step_id`) REFERENCES `steps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
