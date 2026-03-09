import { Composer, Context } from "grammy";
import { CfContext } from "../types";
import { config, ActionConfig } from "../config";

const userCustomComposer = new Composer<CfContext>();

userCustomComposer.on("message", async (ctx, next) => {
    if (!ctx.from) {await next(); return;}
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    if (chatId in config.update_config) {
        const chatConfig = config.update_config[chatId];

        if (userId in chatConfig.users) {
            for (const config of chatConfig.users[userId]) {

                if (config.random && Math.random() * 100 > config.random) continue;
                if (config.timeout) {
                    ctx.executionCtx.waitUntil((async () => {
                        const delay = Math.min(config.timeout!, 10) * 1000;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        await parseMessage(ctx, config);
                    })());
                } else {
                    await parseMessage(ctx, config);
                }
            }
        }
    }
    await next();
});

interface ParseContext {
    chat: { id: number; };
    message: { message_id: number; };
}

async function parseMessage(ctx: ParseContext & Context, config: ActionConfig) {
    const chatId = ctx.chat.id;
    const { reply: shouldReply, reaction, text, sticker, animation } = config;
    const sendResponse = async (method: "text" | "sticker" | "animation", payload: string) => {
        try {
            if (method === "text") {
                shouldReply ? await ctx.reply(payload) : await ctx.api.sendMessage(chatId, payload);
            } else if (method === "sticker") {
                shouldReply ? await ctx.replyWithSticker(payload) : await ctx.api.sendSticker(chatId, payload);
            } else if (method === "animation") {
                shouldReply ? await ctx.replyWithAnimation(payload) : await ctx.api.sendAnimation(chatId, payload);
            }
        } catch (e) {
            console.error("Error sending response:", e);
        }
    };

    if (reaction) {
        try {
            await ctx.api.setMessageReaction(chatId, ctx.message.message_id, [
                { type: "emoji", emoji: reaction as any },
            ]);
        } catch (e) {
            console.error("Error setting reaction:", e);
        }
    }
    if (text) await sendResponse("text", text);
    if (animation) await sendResponse("animation", animation);
    if (sticker) await sendResponse("sticker", sticker);
}


export { userCustomComposer };