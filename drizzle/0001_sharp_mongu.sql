CREATE TABLE `contact_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `category` text DEFAULT 'Project' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `year` integer DEFAULT 2026 NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `technologies` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `demo_url` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `github_url` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `problem` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `role` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `result` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `position` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `updated_at` integer DEFAULT 0 NOT NULL;
