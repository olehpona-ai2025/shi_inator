import { Bot } from "grammy";
import { weeklyStats } from "./weeklyStats";
import { sixSeven } from "./sixSeven";

export interface CronContext {
    bot: Bot;
    db: D1Database;
    executionCtx: ExecutionContext;
}

export type CronFunction = (ctx: CronContext) => Promise<void>;

type CronJob = Record<string, CronFunction[]>;


export class CronRouter {
    private static cronJobs: CronJob = {
        "0 18 * * SUN": [
            weeklyStats
        ],
        "0 6 * * *": [
            sixSeven
        ]
    };

    static async routeJob(cronTime: string, ctx: CronContext) {
        let promiseArray: Promise<void>[] = [];
        if (!CronRouter.cronJobs[cronTime]) return;
        for (let func of CronRouter.cronJobs[cronTime]) {
            promiseArray.push(func(ctx));
        }
        await Promise.all(promiseArray);
    }
}