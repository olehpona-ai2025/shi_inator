import { Bot, webhookCallback } from "grammy";
import { CfContext } from "@/types";
import { ReactionComposer } from "@/routers/reactions";
import { userCustomComposer } from "@/routers/userCustom";
import { customMessagesComposer } from "./routers/customMessages";
import { debugComposer } from "./routers/debug";
import { loadConfig } from "./config";
import { CronContext, CronRouter } from "./cron/cronRouter";
import { ReplyComposer } from "./routers/questionAnswer";
import { ClearComposer } from "./routers/clearDickGrowerBot";


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
        bot.use(ReplyComposer);
        bot.use(ClearComposer)

        try {
            return await webhookCallback(bot, "cloudflare-mod")(request);
        } catch (e: any) {
            console.error("CRITICAL ERROR:", e);
            return new Response(`Worker Error: ${e.message}`, { status: 500 });
        }
    },
    async scheduled(controller, env, ctx) {
        const bot = new Bot(env.BOT_TOKEN);
        await loadConfig(env);
        const cronContext: CronContext = {
            bot,
            db: env.shi_inator_db,
            executionCtx: ctx
        };
        await CronRouter.routeJob(controller.cron, cronContext);

    },
} satisfies ExportedHandler<Env>;