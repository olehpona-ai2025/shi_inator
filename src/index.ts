import { Bot, webhookCallback } from "grammy";
import { CfContext } from "@/types";
import { ReactionComposer } from "@/routers/reactions";
import { userCustomComposer } from "@/routers/userCustom";
import { customMessagesComposer } from "./routers/admin";
import { debugComposer } from "./routers/debug";
import { CronRouter } from "./cron/cronRouter";
import { ReplyComposer } from "./routers/questionAnswer";
import { ClearComposer } from "./routers/clearDickGrowerBot";
import { drizzle } from "drizzle-orm/d1";
import { CronContext } from "./cron/context";


export default {
    async fetch(request, env, ctx): Promise<Response> {
        const bot = new Bot<CfContext>(env.BOT_TOKEN);
        
        bot.use(async (grammyCtx, next) => {
            grammyCtx.db = drizzle(env.shi_inator_db);
            grammyCtx.executionCtx = ctx;
            await next();
        });

        bot.use(debugComposer);
        bot.use(ReactionComposer);
        bot.use(userCustomComposer);
        bot.use(customMessagesComposer);
        bot.use(ReplyComposer);
        bot.use(ClearComposer);

        bot.catch(async (err) => {
            console.error("💥 BOT ERROR:", err)
            await err.ctx.reply("Бочуляк не зміг :( \n\n " + (err.error instanceof Error ? err.error.message : "Unknown error"));
        });

        try {
            return await webhookCallback(bot, "cloudflare-mod")(request);
        } catch (e) {
            console.error("CRITICAL ERROR:", e);
            if (typeof e === "object" && e !== null && "message" in e) {
                return new Response(`Worker Error: ${String(e.message)}`, { status: 500 });
            } else {
                return new Response("Worker Error: An unknown error occurred", { status: 500 });
            }
        }
    },
    async scheduled(controller, env, ctx) {
        const bot = new Bot(env.BOT_TOKEN);
        const cronContext: CronContext = {
            api: bot.api,
            db: drizzle(env.shi_inator_db),
            executionCtx: ctx
        };
        await CronRouter.routeJob(controller.cron, cronContext);

    },
} satisfies ExportedHandler<Env>;