CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image_key` text NOT NULL,
	`image_alt` text NOT NULL,
	`created_at` integer NOT NULL
);
