import { Composer } from "grammy";
import { CfContext } from "../types";
import { config } from "@/config";
import { getRandomPhrase } from "@/services/questionAnswerService";

export const ReplyComposer = new Composer<CfContext>();

const requestFilter = ReplyComposer.filter((ctx) => {
  return ctx.chat !== undefined && config.chats[ctx.chat.id]?.questionAnswer === true;
})

requestFilter.command("answer", async (ctx) => {
    await ctx.reply(getRandomPhrase(), {
        reply_parameters: { message_id: ctx.message!.message_id }
    });
});