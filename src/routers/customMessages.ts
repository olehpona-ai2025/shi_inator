import { Composer } from "grammy";
import { CfContext } from "../types";
import { config } from "../config";

const customMessagesComposer = new Composer<CfContext>();

const adminProtected = customMessagesComposer.filter(
  (ctx) => ctx.chat !== undefined && config.admins.has(ctx.chat.id),
);

function parseTelegramLink(
  link: string,
): { chatId: string | number; messageId: number } {
  const cleanLink = link
    .replace("https://", "")
    .replace("http://", "")
    .replace("t.me/", "");
  const parts = cleanLink.split("/");
  const targetMessageId = parseInt(parts[parts.length - 1]);
  let targetChatId: string | number;

  if (parts[0] === "c") {
    targetChatId = parseInt(`-100${parts[1]}`);
  } else {
    targetChatId = `@${parts[0]}`;
  }

  return { chatId: targetChatId, messageId: targetMessageId };
}

adminProtected.command("send", async (ctx, next) => {
  const match = ctx.match as string;
  const args = match ? match.split(/\s+/) : [];

  if (args.length === 0 && !ctx.message?.reply_to_message) {
    await ctx.reply("Помилка: вкажи ID чату або зроби реплай і обери кнопку.");
    await next();
    return;
  }

  try {
    const targetChatId = args[0];

    if (ctx.message?.reply_to_message) {
      await ctx.api.copyMessage(
        targetChatId,
        ctx.chat.id,
        ctx.message.reply_to_message.message_id,
      );
      await ctx.reply("✅ Скопійовано (реплай)");
    } else if (args.length > 1) {
      const textToSend = match.substring(args[0].length).trim();
      await ctx.api.sendMessage(targetChatId, textToSend);
      await ctx.reply("✅ Надіслано (текст)");
    } else {
      await ctx.reply("🤨 А що відправляти? Зроби реплай або напиши текст.");
    }
  } catch (e: any) {
    await ctx.reply(`❌ Помилка: ${e.message}`);
  }
  await next();
});

adminProtected.command("react", async (ctx, next) => {
  const match = ctx.match as string;
  const args = match ? match.split(/\s+/) : [];
  let emoji: string | null = null;
  let link: string | null = null;

  for (const arg of args) {
    if (arg.includes("t.me/")) link = arg;
    else emoji = arg;
  }

  if (!link) {
    await ctx.reply("❌ Не знайшов посилання на повідомлення.");
    await next();
    return;
  }

  try {
    const { chatId: targetChatId, messageId: targetMessageId } = parseTelegramLink(link);
    if (emoji) {
      await ctx.api.setMessageReaction(targetChatId, targetMessageId, [
        { type: "emoji", emoji: emoji as any },
      ]);
      await ctx.reply(`✅ Встановлено ${emoji} по лінку!`);
    } else {
      await ctx.api.setMessageReaction(targetChatId, targetMessageId, []);
      await ctx.reply("✅ Реакцію видалено по лінку!");
    }
  } catch (e: any) {
    await ctx.reply(`❌ Помилка: ${e.message}`);
  }
  await next();
});

adminProtected.command("remove", async (ctx, next) => {
  const match = ctx.match as string;
  const args = match ? match.split(/\s+/) : [];
  let link: string | null = null;

  for (const arg of args) {
    if (arg.includes("t.me/")) link = arg;
  }

  if (!link) {
    await ctx.reply("❌ Не знайшов посилання на повідомлення.");
    await next();
    return;
  }

  try {
    const { chatId: targetChatId, messageId: targetMessageId } = parseTelegramLink(link);
    await ctx.api.deleteMessage(targetChatId, targetMessageId);
    await ctx.reply(`✅ Видалено повідомлення по лінку!`);
  } catch (e: any) {
    await ctx.reply(`❌ Помилка: ${e.message}`);
  }
  await next();
});

export { customMessagesComposer };
