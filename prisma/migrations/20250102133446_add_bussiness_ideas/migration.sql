-- CreateTable
CREATE TABLE `bussiness_idea` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `response` JSON NULL,
    `user` INTEGER NOT NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bussiness_idea` ADD CONSTRAINT `bussiness_idea_user_fkey` FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
