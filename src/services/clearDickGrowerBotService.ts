import { CronContext } from "@/cron/cronRouter";
import { getBotMessages } from "@/db";

export async function clearDickGrowerBot(ctx: CronContext) {
  const messages = await getBotMessages(ctx.db);

  for (const message of messages) {
    try {
      await ctx.api.deleteMessage(message.chat_id, message.msg_id);
    } catch (e) {
      console.error("Failed to delete message", e);
    }
  }
}