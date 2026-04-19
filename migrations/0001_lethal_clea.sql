CREATE TABLE `plants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sources` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plant_id` integer NOT NULL,
	`description` text NOT NULL,
	`deadline_month` integer NOT NULL,
	`deadline_day` integer NOT NULL,
	`products` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`plant_id`) REFERENCES `plants`(`id`) ON UPDATE no action ON DELETE cascade
);
