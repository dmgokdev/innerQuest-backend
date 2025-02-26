-- AlterTable
ALTER TABLE `user_answers` ADD COLUMN `log_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `user_answers_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `business_id` INTEGER NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_answers` ADD CONSTRAINT `user_answers_log_id_fkey` FOREIGN KEY (`log_id`) REFERENCES `user_answers_logs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_answers_logs` ADD CONSTRAINT `user_answers_logs_business_id_fkey` FOREIGN KEY (`business_id`) REFERENCES `bussiness_idea`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
