CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`resultId` int NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`familiarityLevel` int NOT NULL,
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`percentage` int NOT NULL,
	`answers` json NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_results_id` PRIMARY KEY(`id`)
);
