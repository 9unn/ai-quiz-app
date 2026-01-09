ALTER TABLE `quiz_results` MODIFY COLUMN `userId` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `questionId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `userAnswer` text;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD `isCorrect` int NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_attempts` DROP COLUMN `userId`;--> statement-breakpoint
ALTER TABLE `quiz_attempts` DROP COLUMN `startedAt`;--> statement-breakpoint
ALTER TABLE `quiz_attempts` DROP COLUMN `completedAt`;--> statement-breakpoint
ALTER TABLE `quiz_attempts` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `quiz_results` DROP COLUMN `completedAt`;