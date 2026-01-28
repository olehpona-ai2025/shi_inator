import { Bot, webhookCallback } from "grammy";
import { CfContext } from "@/types";
import { ReactionComposer, sendStatsToAllowedChats } from "@/routers/reactions";
import { userCustomComposer } from "@/routers/userCustom";
import { customMessagesComposer } from "./routers/customMessages";
import { debugComposer } from "./routers/debug";
import { config, loadConfig } from "./config";


export default {
    async fetch(request, env, ctx): Promise<Response> {
        const bot = new Bot<CfContext>(env.BOT_TOKEN);
        await loadConfig(env);

        bot.catch((err) => {
            console.error("💥 BOT ERROR:", err);
        });
        
        bot.use(async (grammyCtx, next) => {
            grammyCtx.db = env.shi_inator_db;
            grammyCtx.executionCtx = ctx;
            await next();
        });

        bot.command("start", async (ctx) => {
            await ctx.reply(`Привіт! Твій ID: ${ctx.from?.id}`);
        });

        bot.use(debugComposer);
        bot.use(ReactionComposer);
        bot.use(userCustomComposer);
        bot.use(customMessagesComposer);

        try {
            return await webhookCallback(bot, "cloudflare-mod")(request);
        } catch (e: any) {
            console.error("CRITICAL ERROR:", e);
            return new Response(`Worker Error: ${e.message}`, { status: 500 });
        }
    },
    async scheduled(controller, env, ctx) {
        const bot = new Bot<CfContext>(env.BOT_TOKEN);
        await sendStatsToAllowedChats(bot.api, env.shi_inator_db);

        try {
            await env.shi_inator_db.prepare("DELETE FROM week_stats").run();
        } catch (e) {
            console.error("DB drop error", e);
        }
    },
} satisfies ExportedHandler<Env>;