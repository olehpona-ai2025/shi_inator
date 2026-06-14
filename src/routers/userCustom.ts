import { Composer } from "grammy";
import { CfContext } from "../types";
import { config } from "../config";
import { parseMessage } from "@/services/userCustomActionsService";

const userCustomComposer = new Composer<CfContext>();

const requestFilter = userCustomComposer.filter((ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;

  if (!userId || !chatId) return false;

  const customActions = config.chats[chatId]?.customActions;

  return customActions !== undefined && userId in customActions;
});

requestFilter.on("message", async (ctx, next) => {
  if (!ctx.from) {
    await next();
    return;
  }
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  ctx.executionCtx.waitUntil(
    parseMessage(
      ctx.api,
      chatId,
      ctx.message.message_id,
      config.chats[chatId].customActions![userId],
    ),
  );
  await next();
});

export { userCustomComposer };
