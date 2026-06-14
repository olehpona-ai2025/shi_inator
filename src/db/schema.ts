import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const reactionWeekStats = sqliteTable(
  "reaction_week_stats",
  {
    msg_id: integer().notNull(),
    chat_id: integer().notNull(),
    author_id: integer().notNull(),
    author_nickname: text().notNull(),
    score: integer().default(0),
  },
  (table) => [primaryKey({ columns: [table.msg_id, table.chat_id] })],
);

export const dickGrowerBotMessages = sqliteTable(
  "dick_grower_bot_messages",
  {
    msg_id: integer().notNull(),
    chat_id: integer().notNull(),
  },
  (table) => [primaryKey({ columns: [table.msg_id, table.chat_id] })],
);
