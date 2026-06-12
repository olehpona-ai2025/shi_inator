import { Composer } from "grammy";
import { CfContext } from "@/types";
import { config } from "@/config";
import { storeBotMessage } from "@/db/dickGrowerBot";

export const ClearComposer = new Composer<CfContext>();

const requestFilter = ClearComposer.filter((ctx) => {
  const chatId = ctx.chat?.id;
  
  if (!chatId || config.chats[chatId]?.clearDickGrowerBot === undefined) {
    return false;
  }

  const targetBot = "DickGrowerBot";
  const isViaBot = ctx.msg?.via_bot?.username === targetBot;
  const isFromBot = ctx.from?.username === targetBot;

  const text = ctx.msg?.text || ctx.msg?.caption || "";
  const isCommandToBot = text.includes(`@${targetBot}`);

  return isViaBot || isFromBot || isCommandToBot;
});

requestFilter.on("message", async (ctx, next) => {
  ctx.executionCtx.waitUntil(
    storeBotMessage(ctx.db, ctx.message.message_id, ctx.message.chat.id),
  );
  await next();
});


