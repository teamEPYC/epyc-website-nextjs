PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE `users_sessions` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`_parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`email` text NOT NULL,
	`reset_password_token` text,
	`reset_password_expiration` text,
	`salt` text,
	`hash` text,
	`login_attempts` numeric DEFAULT 0,
	`lock_until` text
);
CREATE TABLE `media` (
	`id` integer PRIMARY KEY NOT NULL,
	`alt` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`url` text,
	`thumbnail_u_r_l` text,
	`filename` text,
	`mime_type` text,
	`filesize` numeric,
	`width` numeric,
	`height` numeric,
	`focal_x` numeric,
	`focal_y` numeric,
	`sizes_thumbnail_url` text,
	`sizes_thumbnail_width` numeric,
	`sizes_thumbnail_height` numeric,
	`sizes_thumbnail_mime_type` text,
	`sizes_thumbnail_filesize` numeric,
	`sizes_thumbnail_filename` text,
	`sizes_card_url` text,
	`sizes_card_width` numeric,
	`sizes_card_height` numeric,
	`sizes_card_mime_type` text,
	`sizes_card_filesize` numeric,
	`sizes_card_filename` text,
	`sizes_banner_url` text,
	`sizes_banner_width` numeric,
	`sizes_banner_height` numeric,
	`sizes_banner_mime_type` text,
	`sizes_banner_filesize` numeric,
	`sizes_banner_filename` text
);
CREATE TABLE `authors` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`generate_slug` integer DEFAULT true,
	`slug` text NOT NULL,
	`bio` text,
	`avatar_id` integer,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`avatar_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `blogs` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`generate_slug` integer DEFAULT true,
	`slug` text,
	`published_at` text,
	`author_id` integer,
	`read_time` text,
	`excerpt` text,
	`cover_id` integer,
	`content` text,
	`meta_title` text,
	`meta_description` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft',
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`cover_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `_blogs_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_title` text,
	`version_generate_slug` integer DEFAULT true,
	`version_slug` text,
	`version_published_at` text,
	`version_author_id` integer,
	`version_read_time` text,
	`version_excerpt` text,
	`version_cover_id` integer,
	`version_content` text,
	`version_meta_title` text,
	`version_meta_description` text,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_cover_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `projects_type` (
	`order` integer NOT NULL,
	`parent_id` integer NOT NULL,
	`value` text,
	`id` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`generate_slug` integer DEFAULT true,
	`slug` text,
	`thumbnail_id` integer,
	`industry` text,
	`platform` text DEFAULT 'website',
	`redirect_link` text,
	`featured` integer DEFAULT false,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft',
	FOREIGN KEY (`thumbnail_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `_projects_v_version_type` (
	`order` integer NOT NULL,
	`parent_id` integer NOT NULL,
	`value` text,
	`id` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `_projects_v`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `_projects_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_title` text,
	`version_generate_slug` integer DEFAULT true,
	`version_slug` text,
	`version_thumbnail_id` integer,
	`version_industry` text,
	`version_platform` text DEFAULT 'website',
	`version_redirect_link` text,
	`version_featured` integer DEFAULT false,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_thumbnail_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `gallery` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`generate_slug` integer DEFAULT true,
	`slug` text,
	`thumbnail_id` integer,
	`video_url` text,
	`designers` text,
	`description` text,
	`preview_link` text,
	`year` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`_status` text DEFAULT 'draft',
	FOREIGN KEY (`thumbnail_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `_gallery_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_title` text,
	`version_generate_slug` integer DEFAULT true,
	`version_slug` text,
	`version_thumbnail_id` integer,
	`version_video_url` text,
	`version_designers` text,
	`version_description` text,
	`version_preview_link` text,
	`version_year` text,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `gallery`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_thumbnail_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `submissions` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`budget` numeric NOT NULL,
	`details` text NOT NULL,
	`source` text NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE TABLE `payload_kv` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`data` text NOT NULL
);
CREATE TABLE `payload_jobs_log` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`executed_at` text NOT NULL,
	`completed_at` text NOT NULL,
	`task_slug` text NOT NULL,
	`task_i_d` text NOT NULL,
	`input` text,
	`output` text,
	`state` text NOT NULL,
	`error` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `payload_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `payload_jobs` (
	`id` integer PRIMARY KEY NOT NULL,
	`input` text,
	`completed_at` text,
	`total_tried` numeric DEFAULT 0,
	`has_error` integer DEFAULT false,
	`error` text,
	`task_slug` text,
	`queue` text DEFAULT 'default',
	`wait_until` text,
	`processing` integer DEFAULT false,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE TABLE `payload_locked_documents` (
	`id` integer PRIMARY KEY NOT NULL,
	`global_slug` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE TABLE `payload_locked_documents_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`users_id` integer,
	`media_id` integer,
	`authors_id` integer,
	`blogs_id` integer,
	`projects_id` integer,
	`gallery_id` integer,
	`submissions_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `payload_locked_documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`authors_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`blogs_id`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`projects_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gallery_id`) REFERENCES `gallery`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`submissions_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `payload_preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`key` text,
	`value` text,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE TABLE `payload_preferences_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`users_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `payload_preferences`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `payload_migrations` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`batch` numeric,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
CREATE INDEX `users_sessions_order_idx` ON `users_sessions` (`_order`);
CREATE INDEX `users_sessions_parent_id_idx` ON `users_sessions` (`_parent_id`);
CREATE INDEX `users_updated_at_idx` ON `users` (`updated_at`);
CREATE INDEX `users_created_at_idx` ON `users` (`created_at`);
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);
CREATE INDEX `media_updated_at_idx` ON `media` (`updated_at`);
CREATE INDEX `media_created_at_idx` ON `media` (`created_at`);
CREATE UNIQUE INDEX `media_filename_idx` ON `media` (`filename`);
CREATE INDEX `media_sizes_thumbnail_sizes_thumbnail_filename_idx` ON `media` (`sizes_thumbnail_filename`);
CREATE INDEX `media_sizes_card_sizes_card_filename_idx` ON `media` (`sizes_card_filename`);
CREATE INDEX `media_sizes_banner_sizes_banner_filename_idx` ON `media` (`sizes_banner_filename`);
CREATE INDEX `authors_name_idx` ON `authors` (`name`);
CREATE UNIQUE INDEX `authors_slug_idx` ON `authors` (`slug`);
CREATE INDEX `authors_avatar_idx` ON `authors` (`avatar_id`);
CREATE INDEX `authors_updated_at_idx` ON `authors` (`updated_at`);
CREATE INDEX `authors_created_at_idx` ON `authors` (`created_at`);
CREATE INDEX `blogs_title_idx` ON `blogs` (`title`);
CREATE UNIQUE INDEX `blogs_slug_idx` ON `blogs` (`slug`);
CREATE INDEX `blogs_published_at_idx` ON `blogs` (`published_at`);
CREATE INDEX `blogs_author_idx` ON `blogs` (`author_id`);
CREATE INDEX `blogs_cover_idx` ON `blogs` (`cover_id`);
CREATE INDEX `blogs_updated_at_idx` ON `blogs` (`updated_at`);
CREATE INDEX `blogs_created_at_idx` ON `blogs` (`created_at`);
CREATE INDEX `blogs__status_idx` ON `blogs` (`_status`);
CREATE INDEX `_blogs_v_parent_idx` ON `_blogs_v` (`parent_id`);
CREATE INDEX `_blogs_v_version_version_title_idx` ON `_blogs_v` (`version_title`);
CREATE INDEX `_blogs_v_version_version_slug_idx` ON `_blogs_v` (`version_slug`);
CREATE INDEX `_blogs_v_version_version_published_at_idx` ON `_blogs_v` (`version_published_at`);
CREATE INDEX `_blogs_v_version_version_author_idx` ON `_blogs_v` (`version_author_id`);
CREATE INDEX `_blogs_v_version_version_cover_idx` ON `_blogs_v` (`version_cover_id`);
CREATE INDEX `_blogs_v_version_version_updated_at_idx` ON `_blogs_v` (`version_updated_at`);
CREATE INDEX `_blogs_v_version_version_created_at_idx` ON `_blogs_v` (`version_created_at`);
CREATE INDEX `_blogs_v_version_version__status_idx` ON `_blogs_v` (`version__status`);
CREATE INDEX `_blogs_v_created_at_idx` ON `_blogs_v` (`created_at`);
CREATE INDEX `_blogs_v_updated_at_idx` ON `_blogs_v` (`updated_at`);
CREATE INDEX `_blogs_v_latest_idx` ON `_blogs_v` (`latest`);
CREATE INDEX `projects_type_order_idx` ON `projects_type` (`order`);
CREATE INDEX `projects_type_parent_idx` ON `projects_type` (`parent_id`);
CREATE INDEX `projects_title_idx` ON `projects` (`title`);
CREATE UNIQUE INDEX `projects_slug_idx` ON `projects` (`slug`);
CREATE INDEX `projects_thumbnail_idx` ON `projects` (`thumbnail_id`);
CREATE INDEX `projects_industry_idx` ON `projects` (`industry`);
CREATE INDEX `projects_featured_idx` ON `projects` (`featured`);
CREATE INDEX `projects_updated_at_idx` ON `projects` (`updated_at`);
CREATE INDEX `projects_created_at_idx` ON `projects` (`created_at`);
CREATE INDEX `projects__status_idx` ON `projects` (`_status`);
CREATE INDEX `_projects_v_version_type_order_idx` ON `_projects_v_version_type` (`order`);
CREATE INDEX `_projects_v_version_type_parent_idx` ON `_projects_v_version_type` (`parent_id`);
CREATE INDEX `_projects_v_parent_idx` ON `_projects_v` (`parent_id`);
CREATE INDEX `_projects_v_version_version_title_idx` ON `_projects_v` (`version_title`);
CREATE INDEX `_projects_v_version_version_slug_idx` ON `_projects_v` (`version_slug`);
CREATE INDEX `_projects_v_version_version_thumbnail_idx` ON `_projects_v` (`version_thumbnail_id`);
CREATE INDEX `_projects_v_version_version_industry_idx` ON `_projects_v` (`version_industry`);
CREATE INDEX `_projects_v_version_version_featured_idx` ON `_projects_v` (`version_featured`);
CREATE INDEX `_projects_v_version_version_updated_at_idx` ON `_projects_v` (`version_updated_at`);
CREATE INDEX `_projects_v_version_version_created_at_idx` ON `_projects_v` (`version_created_at`);
CREATE INDEX `_projects_v_version_version__status_idx` ON `_projects_v` (`version__status`);
CREATE INDEX `_projects_v_created_at_idx` ON `_projects_v` (`created_at`);
CREATE INDEX `_projects_v_updated_at_idx` ON `_projects_v` (`updated_at`);
CREATE INDEX `_projects_v_latest_idx` ON `_projects_v` (`latest`);
CREATE INDEX `gallery_title_idx` ON `gallery` (`title`);
CREATE UNIQUE INDEX `gallery_slug_idx` ON `gallery` (`slug`);
CREATE INDEX `gallery_thumbnail_idx` ON `gallery` (`thumbnail_id`);
CREATE INDEX `gallery_updated_at_idx` ON `gallery` (`updated_at`);
CREATE INDEX `gallery_created_at_idx` ON `gallery` (`created_at`);
CREATE INDEX `gallery__status_idx` ON `gallery` (`_status`);
CREATE INDEX `_gallery_v_parent_idx` ON `_gallery_v` (`parent_id`);
CREATE INDEX `_gallery_v_version_version_title_idx` ON `_gallery_v` (`version_title`);
CREATE INDEX `_gallery_v_version_version_slug_idx` ON `_gallery_v` (`version_slug`);
CREATE INDEX `_gallery_v_version_version_thumbnail_idx` ON `_gallery_v` (`version_thumbnail_id`);
CREATE INDEX `_gallery_v_version_version_updated_at_idx` ON `_gallery_v` (`version_updated_at`);
CREATE INDEX `_gallery_v_version_version_created_at_idx` ON `_gallery_v` (`version_created_at`);
CREATE INDEX `_gallery_v_version_version__status_idx` ON `_gallery_v` (`version__status`);
CREATE INDEX `_gallery_v_created_at_idx` ON `_gallery_v` (`created_at`);
CREATE INDEX `_gallery_v_updated_at_idx` ON `_gallery_v` (`updated_at`);
CREATE INDEX `_gallery_v_latest_idx` ON `_gallery_v` (`latest`);
CREATE INDEX `submissions_updated_at_idx` ON `submissions` (`updated_at`);
CREATE INDEX `submissions_created_at_idx` ON `submissions` (`created_at`);
CREATE UNIQUE INDEX `payload_kv_key_idx` ON `payload_kv` (`key`);
CREATE INDEX `payload_jobs_log_order_idx` ON `payload_jobs_log` (`_order`);
CREATE INDEX `payload_jobs_log_parent_id_idx` ON `payload_jobs_log` (`_parent_id`);
CREATE INDEX `payload_jobs_completed_at_idx` ON `payload_jobs` (`completed_at`);
CREATE INDEX `payload_jobs_total_tried_idx` ON `payload_jobs` (`total_tried`);
CREATE INDEX `payload_jobs_has_error_idx` ON `payload_jobs` (`has_error`);
CREATE INDEX `payload_jobs_task_slug_idx` ON `payload_jobs` (`task_slug`);
CREATE INDEX `payload_jobs_queue_idx` ON `payload_jobs` (`queue`);
CREATE INDEX `payload_jobs_wait_until_idx` ON `payload_jobs` (`wait_until`);
CREATE INDEX `payload_jobs_processing_idx` ON `payload_jobs` (`processing`);
CREATE INDEX `payload_jobs_updated_at_idx` ON `payload_jobs` (`updated_at`);
CREATE INDEX `payload_jobs_created_at_idx` ON `payload_jobs` (`created_at`);
CREATE INDEX `payload_locked_documents_global_slug_idx` ON `payload_locked_documents` (`global_slug`);
CREATE INDEX `payload_locked_documents_updated_at_idx` ON `payload_locked_documents` (`updated_at`);
CREATE INDEX `payload_locked_documents_created_at_idx` ON `payload_locked_documents` (`created_at`);
CREATE INDEX `payload_locked_documents_rels_order_idx` ON `payload_locked_documents_rels` (`order`);
CREATE INDEX `payload_locked_documents_rels_parent_idx` ON `payload_locked_documents_rels` (`parent_id`);
CREATE INDEX `payload_locked_documents_rels_path_idx` ON `payload_locked_documents_rels` (`path`);
CREATE INDEX `payload_locked_documents_rels_users_id_idx` ON `payload_locked_documents_rels` (`users_id`);
CREATE INDEX `payload_locked_documents_rels_media_id_idx` ON `payload_locked_documents_rels` (`media_id`);
CREATE INDEX `payload_locked_documents_rels_authors_id_idx` ON `payload_locked_documents_rels` (`authors_id`);
CREATE INDEX `payload_locked_documents_rels_blogs_id_idx` ON `payload_locked_documents_rels` (`blogs_id`);
CREATE INDEX `payload_locked_documents_rels_projects_id_idx` ON `payload_locked_documents_rels` (`projects_id`);
CREATE INDEX `payload_locked_documents_rels_gallery_id_idx` ON `payload_locked_documents_rels` (`gallery_id`);
CREATE INDEX `payload_locked_documents_rels_submissions_id_idx` ON `payload_locked_documents_rels` (`submissions_id`);
CREATE INDEX `payload_preferences_key_idx` ON `payload_preferences` (`key`);
CREATE INDEX `payload_preferences_updated_at_idx` ON `payload_preferences` (`updated_at`);
CREATE INDEX `payload_preferences_created_at_idx` ON `payload_preferences` (`created_at`);
CREATE INDEX `payload_preferences_rels_order_idx` ON `payload_preferences_rels` (`order`);
CREATE INDEX `payload_preferences_rels_parent_idx` ON `payload_preferences_rels` (`parent_id`);
CREATE INDEX `payload_preferences_rels_path_idx` ON `payload_preferences_rels` (`path`);
CREATE INDEX `payload_preferences_rels_users_id_idx` ON `payload_preferences_rels` (`users_id`);
CREATE INDEX `payload_migrations_updated_at_idx` ON `payload_migrations` (`updated_at`);
CREATE INDEX `payload_migrations_created_at_idx` ON `payload_migrations` (`created_at`);