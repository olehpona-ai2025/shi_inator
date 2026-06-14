import { dickGrowerBotMessages } from "./schema";
import { DbClient } from "./types";

export async function storeBotMessage(
  db: DbClient,
  messageId: number,
  chatId: number,
) {
  await db
    .insert(dickGrowerBotMessages)
    .values({
      msg_id: messageId,
      chat_id: chatId,
    })
    .onConflictDoNothing();
}

export async function getBotMessages(
  db: DbClient,
): Promise<{ msg_id: number; chat_id: number }[]> {
  return await db.delete(dickGrowerBotMessages).returning();
}
