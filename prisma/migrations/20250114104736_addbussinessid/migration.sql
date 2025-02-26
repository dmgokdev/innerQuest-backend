-- AlterTable
ALTER TABLE `payments` ADD COLUMN `bussiness_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_bussiness_id_fkey` FOREIGN KEY (`bussiness_id`) REFERENCES `bussiness_idea`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
