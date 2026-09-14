import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageKey: text('image_key').notNull(),
  imageAlt: text('image_alt').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
});
