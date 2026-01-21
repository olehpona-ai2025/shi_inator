import { Bot, webhookCallback } from "grammy";
import { CfContext } from "./types";
import { ReactionComposer, sendStatsToAllowedChats } from "./reactions";
import { userCustomComposer } from "./userCustom";


export default {
    async fetch(request, env, ctx): Promise<Response> {
        const bot = new Bot<CfContext>(env.BOT_TOKEN);
        
        bot.use(async (grammyCtx, next) => {
            grammyCtx.db = env.shi_inator_db;
            grammyCtx.executionCtx = ctx;
            await next();
        });

        bot.command("start", async (ctx) => {
            await ctx.reply(`Привіт! Твій ID: ${ctx.from?.id}`);
        });

        const pm = bot.chatType("private");
        pm.on("message", async (ctx, next) => {
            if (ctx.message.text?.startsWith("/")) return next();

            const userId = ctx.from.id;
            let responseText = `👤 **Твій User ID:** \`${userId}\``;

            if (ctx.message.sticker) {
                responseText += `\n\n🤡 **Sticker ID:**\n\`${ctx.message.sticker.file_id}\``;
            }
            if (ctx.message.animation) {
                responseText += `\n\n🎬 **GIF ID:**\n\`${ctx.message.animation.file_id}\``;
            }

            await ctx.reply(responseText, { parse_mode: "Markdown" });
            return next();
        });

        bot.use(ReactionComposer);
        bot.use(userCustomComposer);

        try {
            return await webhookCallback(bot, "cloudflare-mod")(request);
        } catch (e: any) {
            console.error("CRITICAL ERROR:", e);
            return new Response(`Worker Error: ${e.message}`, { status: 500 });
        }
    },
    async scheduled(controller, env, ctx) {
        const bot = new Bot<CfContext>(env.BOT_TOKEN);
        await sendStatsToAllowedChats(bot, env.shi_inator_db);
        console.log("🧹 Починаю щотижневу очистку бази...");
        try {
            await env.shi_inator_db.prepare("DELETE FROM week_stats").run();

            console.log("✅ База успішно очищена. Новий тиждень розпочато!");
        } catch (e) {
            console.error("❌ Помилка при очистці бази:", e);
        }
    },
} satisfies ExportedHandler<Env & {
    BOT_TOKEN: string;
}>;