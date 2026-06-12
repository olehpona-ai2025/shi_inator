import { and, eq, ne, sql, desc, asc, lt } from "drizzle-orm";
import { union } from "drizzle-orm/sqlite-core";
import { reactionWeekStats } from "./schema";
import { DbClient } from "./types";

export interface MessageCreationData {
  messageId: number;
  chatId: number;
  authorId: number;
  authorName: string;
}

export async function addNewMessage(db: DbClient, data: MessageCreationData) {
  await db
    .insert(reactionWeekStats)
    .values({
      msg_id: data.messageId,
      chat_id: data.chatId,
      author_id: data.authorId,
      author_nickname: data.authorName,
    })
    .onConflictDoNothing();
}

export interface MessageScoreUpdateData {
  messageId: number;
  chatId: number;
  authorId: number;
  delta: number;
}

export async function updateMessageScore(
  db: DbClient,
  data: MessageScoreUpdateData,
) {
  await db
    .update(reactionWeekStats)
    .set({ score: sql`score + ${data.delta}` })
    .where(
      and(
        eq(reactionWeekStats.chat_id, data.chatId),
        ne(reactionWeekStats.author_id, data.authorId),
        eq(reactionWeekStats.msg_id, data.messageId),
      ),
    );
}

export interface ReactionCountResult {
  name: string;
  score: number;
}

export async function getChatStats(
  db: DbClient,
  chatId: number,
): Promise<ReactionCountResult[]> {
  const userScoresSubquery = db
    .select({
      name: reactionWeekStats.author_nickname,
      score: sql<number>`sum(${reactionWeekStats.score})`.as("score"),
    })
    .from(reactionWeekStats)
    .where(eq(reactionWeekStats.chat_id, chatId))
    .groupBy(reactionWeekStats.author_id)
    .as("user_scores_sq");

  const most = db
    .select()
    .from(userScoresSubquery)
    .orderBy(desc(userScoresSubquery.score))
    .limit(5)
    .as("most_sq");

  const least = db
    .select()
    .from(userScoresSubquery)
    .where(lt(userScoresSubquery.score, 0))
    .orderBy(asc(userScoresSubquery.score))
    .limit(5)
    .as("least_sq");

  const mostSubquery = db.select().from(most);
  const leastSubquery = db.select().from(least);

  return await union(mostSubquery, leastSubquery).orderBy(desc(sql`score`));
}

export async function deleteAllStats(db: DbClient) {
  await db.delete(reactionWeekStats);
}
