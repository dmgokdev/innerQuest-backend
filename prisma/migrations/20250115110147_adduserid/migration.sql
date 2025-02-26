-- AlterTable
ALTER TABLE `user_answers_logs` ADD COLUMN `user_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user_answers_logs` ADD CONSTRAINT `user_answers_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
