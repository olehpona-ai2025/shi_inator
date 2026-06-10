import { Composer } from "grammy"
import { CfContext } from "@/types";
import { config } from "@/config";
import { getBotMessages, storeBotMessage } from "@/db";
import { CronContext } from "@/cron/cronRouter";

export const ClearComposer = new Composer<CfContext>();

ClearComposer.on("message", async (ctx, next) => {
    if (ctx.msg.via_bot?.username !== "DickGrowerBot" || !config.allowed_chats.has(ctx.chat.id)) {
        await next();
        return;
    }

    await storeBotMessage(ctx.db, ctx.message.message_id, ctx.message.chat.id);

    await next();
});

export async function clearDickGrowerBot(ctx: CronContext) {
    const messages = await getBotMessages(ctx.db)

    for (let message of messages) {
        try {
            await ctx.bot.api.deleteMessage(message.chat_id, message.msg_id);
        } catch (e) {
            console.error("Failed to delete message", e);
        }
    }
}