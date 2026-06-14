import { sendStatsToAllowedChats } from "@/services/reactionService";
import { CronContext } from "./context";
import { deleteAllStats } from "@/db/reactionsRepository";

export async function weeklyStats(ctx: CronContext): Promise<void> {
  await sendStatsToAllowedChats(ctx.api, ctx.db);

  ctx.executionCtx.waitUntil(
    deleteAllStats(ctx.db).catch((e) => console.error("DB drop error", e)),
  );
}
