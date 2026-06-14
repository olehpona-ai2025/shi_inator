import { CronContext } from "./context";
import { weeklyStats } from "./weeklyStats";
import { clearDickGrowerBot } from "@/cron/clearDickGrowerBot";

export type CronFunction = (ctx: CronContext) => Promise<void>;
type CronJob = Record<string, CronFunction[]>;

export class CronDispatcher {
  private static cronJobs: CronJob = {
    "0 18 * * SUN": [weeklyStats],
    "0 6 * * *": [clearDickGrowerBot],
  };

  static async routeJob(cronTime: string, ctx: CronContext) {
    const promiseArray: Promise<void>[] = [];
    if (!CronDispatcher.cronJobs[cronTime]) return;
    for (const func of CronDispatcher.cronJobs[cronTime]) {
      promiseArray.push(func(ctx));
    }
    await Promise.all(promiseArray);
  }
}
