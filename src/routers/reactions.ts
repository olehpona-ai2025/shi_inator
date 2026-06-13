import { config } from "@/config";
import { addNewMessage, getChatStats } from "@/db/reactionsRepository";
import {
  buildStatsMessage,
  sendStatsToAllowedChats,
  updateMessageScoreOnReactionChange,
} from "@/services/reactionService";
import { CfContext } from "@/types";
import { Composer } from "grammy";

export const ReactionComposer = new Composer<CfContext>();

const requestFilter = ReactionComposer.filter((ctx) => {
  const chatId = ctx.chat?.id;
  const user = ctx.from;

  if (!chatId || !user || user.is_bot) return false;

  return config.chats[chatId]?.reactions !== undefined;
});

const reactionFilter = ReactionComposer.filter((ctx) => {
  const reaction = ctx.messageReaction;
  if (!reaction) return false;

  const user = reaction.user;
  if (!user || user.is_bot) return false;
  return config.chats[reaction.chat.id]?.reactions !== undefined;
});

reactionFilter.on("message_reaction", async (ctx, next) => {
  const chatId = ctx.chat.id;
  const userId = ctx.messageReaction.user?.id;
  const messageId = ctx.messageReaction.message_id;

  if (!userId) {
    await next();
    return;
  }

  ctx.executionCtx.waitUntil(
    updateMessageScoreOnReactionChange(
      ctx.db,
      chatId,
      messageId,
      userId,
      ctx.messageReaction.old_reaction,
      ctx.messageReaction.new_reaction,
    ),
  );
  await next();
});

requestFilter.on("message", async (ctx, next) => {
  ctx.executionCtx.waitUntil(
    addNewMessage(ctx.db, {
      messageId: ctx.message.message_id,
      chatId: ctx.chat.id,
      authorId: ctx.from.id,
      authorName: ctx.from.username || ctx.from.first_name,
    }),
  );
  await next();
});

const adminProtected = ReactionComposer.chatType("private").filter((ctx) =>
  config.admins.has(ctx.chat.id),
);

adminProtected.command("weekstats", async (ctx) => {
  const match = ctx.match;
  const args = match ? match.split(/\s+/) : [];

  if (args.length < 1) {
    await ctx.reply("❌ Будь ласка, вкажи ID чату.");
    return;
  }

  const chatId = args[0];
  const data = await getChatStats(ctx.db, Number(chatId));
  if (data.length === 0) {
    await ctx.reply("❌ Немає даних для цього чату.");
    return;
  }

  const statsMessage = buildStatsMessage(data);
  await ctx.reply(statsMessage, {
    parse_mode: "Markdown",
  });
});

adminProtected.command("manual_weekstats", async (ctx) => {
  await sendStatsToAllowedChats(ctx.api, ctx.db);
});
