import { Composer } from "grammy";
import { CfContext } from "../types";
import { config } from "../config";
import {
  banUserFromChat,
  copyMessageToChat,
  removeMessage,
  sendMessageToChat,
  setMessageReaction,
  unBanUserFromChat,
} from "@/services/adminService";
import { parseTelegramLink } from "@/utils/telegram";

const customMessagesComposer = new Composer<CfContext>();

const adminProtected = customMessagesComposer
  .chatType("private")
  .filter((ctx) => config.admins.has(ctx.chat.id));

adminProtected.command("ban", async (ctx) => {
  const args = ctx.match.trim().split(/\s+/);

  if (args.length < 2) {
    await ctx.reply("Invalid format. Use: /ban <group_id> <user_id>");
    return;
  }

  const groupId = Number(args[0]);
  const userId = Number(args[1]);

  if (isNaN(userId)) {
    await ctx.reply("User ID must be a number.");
    return;
  }

  await banUserFromChat(ctx.api, groupId, userId);
  await ctx.reply(`User ${userId} has been banned from group ${groupId}.`);
});

adminProtected.command("unban", async (ctx) => {
  const args = ctx.match.trim().split(/\s+/);

  if (args.length < 2) {
    await ctx.reply("Invalid format. Use: /unban <group_id> <user_id>");
    return;
  }

  const groupId = Number(args[0]);
  const userId = Number(args[1]);

  if (isNaN(userId)) {
    await ctx.reply("User ID must be a number.");
    return;
  }

  await unBanUserFromChat(ctx.api, groupId, userId);
  await ctx.reply(`User ${userId} has been unbanned from group ${groupId}.`);
});

adminProtected.command("send", async (ctx) => {
  const match = ctx.match;
  const args = match ? match.split(/\s+/) : [];

  if (args.length === 0 && !ctx.message?.reply_to_message) {
    await ctx.reply(
      "Bad format. Use: /send <chat_id> <text> OR reply to a message with /send <chat_id>",
    );
    return;
  }

  const targetChatId = Number(args[0]);

  if (isNaN(targetChatId)) {
    await ctx.reply("Chat ID must be a number.");
    return;
  }

  if (ctx.message?.reply_to_message) {
    await copyMessageToChat(
      ctx.api,
      targetChatId,
      ctx.chat.id,
      ctx.message.reply_to_message.message_id,
    );
    await ctx.reply("Copied message sent!");
  } else if (args.length > 1) {
    const textToSend = match.substring(args[0].length).trim();
    await sendMessageToChat(ctx.api, targetChatId, textToSend);
    await ctx.reply("Message sent!");
  } else {
    await ctx.reply(
      "Bad format. Use: /send <chat_id> <text> OR reply to a message with /send <chat_id>",
    );
  }
});

adminProtected.command("react", async (ctx) => {
  const match = ctx.match;
  const args = match ? match.split(/\s+/) : [];
  let emoji: string | null = null;
  let link: string | null = null;

  for (const arg of args) {
    if (arg.includes("t.me/")) link = arg;
    else emoji = arg;
  }

  if (!link) {
    await ctx.reply(
      "Link not found. Use: /react <emoji> <message_link> OR /react <message_link> to remove reaction",
    );
    return;
  }

  const { chatId: targetChatId, messageId: targetMessageId } =
    parseTelegramLink(link);

  const numberTargetChatId = Number(targetChatId);
  if (isNaN(numberTargetChatId)) {
    await ctx.reply("Chat ID must be a number.");
    return;
  }

  await setMessageReaction(
    ctx.api,
    numberTargetChatId,
    targetMessageId,
    emoji ? [emoji] : [],
  );
  await ctx.reply(`Reaction ${emoji} added to the message!`);
});

adminProtected.command("remove", async (ctx) => {
  const match = ctx.match;
  const args = match ? match.split(/\s+/) : [];
  let link: string | null = null;

  for (const arg of args) {
    if (arg.includes("t.me/")) link = arg;
  }

  if (!link) {
    await ctx.reply("Link not found. Use: /remove <message_link>");
    return;
  }

  const { chatId: targetChatId, messageId: targetMessageId } =
    parseTelegramLink(link);

  const numberTargetChatId = Number(targetChatId);
  if (isNaN(numberTargetChatId)) {
    await ctx.reply("Chat ID must be a number.");
    return;
  }

  await removeMessage(ctx.api, numberTargetChatId, targetMessageId);
  await ctx.reply(`Message removed!`);
});

export { customMessagesComposer };
