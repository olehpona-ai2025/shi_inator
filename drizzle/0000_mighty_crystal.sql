CREATE TABLE `dick_grower_bot_messages` (
	`msg_id` integer NOT NULL,
	`chat_id` integer NOT NULL,
	PRIMARY KEY(`msg_id`, `chat_id`)
);
--> statement-breakpoint
CREATE TABLE `reaction_week_stats` (
	`msg_id` integer NOT NULL,
	`chat_id` integer NOT NULL,
	`author_id` integer NOT NULL,
	`author_nickname` text NOT NULL,
	`score` integer DEFAULT 0,
	PRIMARY KEY(`msg_id`, `chat_id`)
);
