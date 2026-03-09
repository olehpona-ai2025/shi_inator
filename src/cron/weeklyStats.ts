import { sendStatsToAllowedChats } from "@/routers/reactions";
import { CronContext } from "./cronRouter";

export async function weeklyStats(ctx: CronContext): Promise<void> {
    await sendStatsToAllowedChats(ctx.bot.api, ctx.db);

    ctx.executionCtx.waitUntil(ctx.db.prepare("DELETE FROM week_stats")
        .run()
        .catch(e => console.error("DB drop error", e))
    );
}