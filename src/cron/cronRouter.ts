import { CronContext } from "./context";
import { weeklyStats } from "./weeklyStats";
import { clearDickGrowerBot } from "@/services/clearDickGrowerBotService";

export type CronFunction = (ctx: CronContext) => Promise<void>;
type CronJob = Record<string, CronFunction[]>;

export class CronRouter {
    private static cronJobs: CronJob = {
        "0 18 * * SUN": [
            weeklyStats
        ],
        "0 6 * * *": [
            clearDickGrowerBot
        ]
    };

    static async routeJob(cronTime: string, ctx: CronContext) {
        const promiseArray: Promise<void>[] = [];
        if (!CronRouter.cronJobs[cronTime]) return;
        for (const func of CronRouter.cronJobs[cronTime]) {
            promiseArray.push(func(ctx));
        }
        await Promise.all(promiseArray);
    }
}