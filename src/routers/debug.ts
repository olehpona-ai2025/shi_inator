import { CfContext } from "@/types";
import { Composer } from "grammy";

export const debugComposer = new Composer<CfContext>();

debugComposer.chatType("private").on("message", async (ctx, next) => {
  if (ctx.message.text?.startsWith("/")) {
    await next();
    return;
  }

  const userId = ctx.from.id;
  let responseText = `👤 **Твій User ID:** \`${userId}\``;

  if (ctx.message.sticker) {
    responseText += `\n\n**Sticker ID:**\n\`${ctx.message.sticker.file_id}\``;
  }
  if (ctx.message.animation) {
    responseText += `\n\n**GIF ID:**\n\`${ctx.message.animation.file_id}\``;
  }

  await ctx.reply(responseText, { parse_mode: "Markdown" });
  await next();
});

debugComposer.command("debug", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    return;
  }

  await ctx.deleteMessage();

  const responseText = `**chat Id** \`${ctx.chat.id}\` `;
  await ctx.api.sendMessage(userId, responseText, { parse_mode: "Markdown" });
});
