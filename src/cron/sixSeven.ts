import { config } from "@/config";
import { CronContext } from "./cronRouter";

const date = new Date("2026-03-07T00:00:00");

export async function sixSeven(ctx: CronContext): Promise<void> {
    const currentDay = 100 - Math.floor(((new Date()).getTime() - date.getTime()) / 86400000);

    for (let i of config.allowed_chats) {
        if (currentDay > 67) {
            await ctx.bot.api.sendMessage(i, `${currentDay}`);
        } else if (currentDay == 67) {
            await ctx.bot.api.sendAnimation(i, "CgACAgQAAxkBAAIPXWmq7lhZ6wAB4DAD6HXsGpvwS4XUEgACYAkAAtcsLVJxj74qCDW2WDoE");
        }
    }
}