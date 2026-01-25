import { Composer, Context } from "grammy";
import { CfContext } from "./types";
import { ADMIN_ID } from "./const";

interface ActionConfig {
    sticker?: string;
    text?: string;
    animation?: string;
    reaction?: string;
    random?: number;
    timeout?: number;
    reply?: boolean;
}

interface UserConfig extends ActionConfig { }

interface ChatConfig {
    users: Record<number, UserConfig[]>;
}

const CHATS_CONFIG: Record<string, ChatConfig> = {
    "-1003545584995": {
        users: {
            5923340571: [{ reaction: "😍" }],
            1157828407: [{ reaction: "🤡" }],
            1125505843: [{ reaction: "🔥" }],
            1979765201: [{ reaction: "🏆" }],
            534062947: [{
                sticker: "CAACAgIAAxkBAAOXaWfvXGwuOBTV0Csy1yb5F9ldo44AAiFaAAJE2OFIDpOkrA4hvX04BA",
                reply: true
            }]
        }
    },
    "-1002750833285": {
        users: {
            1125505843: [{ reaction: "🔥" }],
            5923340571: [{ reaction: "😍" }],
            1043033198: [{ reaction: "🤡", random: 30, timeout: 10 }],
            1979765201: [{ reaction: "🏆" }],
        }
    },
    "-4919067380": {
        users: {
            1125505843: [{ reaction: "🔥" }],
            5923340571: [{ reaction: "😍" }],
            1157828407: [{ reaction: "🤡" }],
            1979765201: [{ reaction: "🏆" }]
        }
    },
    "-1003510672503": {
        users: {
            1157828407: [{ reaction: "🤡", timeout: 2 }]
        }
    }
};

const userCustomComposer = new Composer<CfContext>();

userCustomComposer.command("send", async (ctx, next) => {
    if (ctx.from?.id !== ADMIN_ID) { await next(); return; }

    const match = ctx.match as string;
    const args = match ? match.split(/\s+/) : [];

    if (args.length === 0 && !ctx.message?.reply_to_message) {
        await ctx.reply("Помилка: вкажи ID чату або зроби реплай і обери кнопку.");
        await next();
        return;
    }

    try {
        const targetChatId = args[0];

        if (ctx.message?.reply_to_message) {
            await ctx.api.copyMessage(targetChatId, ctx.chat.id, ctx.message.reply_to_message.message_id);
            await ctx.reply("✅ Скопійовано (реплай)");
        } else if (args.length > 1) {
            const textToSend = match.substring(args[0].length).trim();
            await ctx.api.sendMessage(targetChatId, textToSend);
            await ctx.reply("✅ Надіслано (текст)");
        } else {
            await ctx.reply("🤨 А що відправляти? Зроби реплай або напиши текст.");
        }
    } catch (e: any) {
        await ctx.reply(`❌ Помилка: ${e.message}`);
    }
    await next();
});

userCustomComposer.command("react", async (ctx, next) => {
    if (ctx.from?.id !== ADMIN_ID) { await next(); return; }

    const match = ctx.match as string;
    const args = match ? match.split(/\s+/) : [];
    let emoji: string | null = null;
    let link: string | null = null;

    for (const arg of args) {
        if (arg.includes("t.me/")) link = arg;
        else emoji = arg;
    }

    if (!link && ctx.message?.reply_to_message) {
        if (ctx.message.reply_to_message.text?.includes("t.me/")) {
            link = ctx.message.reply_to_message.text.trim();
        } else {
            try {
                if (emoji) await ctx.api.setMessageReaction(ctx.message.reply_to_message.chat.id, ctx.message.reply_to_message.message_id, [
                    { type: "emoji", emoji: emoji as any },
                ]);
                await ctx.reply("✅ Готово (локально).");
                await next();
                return;
            } catch (e: any) {
                await ctx.reply(`Error: ${e.message}`);
                await next();
                return;
            }
        }
    }

    if (!link) { await ctx.reply("❌ Не знайшов посилання на повідомлення."); await next(); return; }

    try {
        const cleanLink = link.replace("https://", "").replace("http://", "").replace("t.me/", "");
        const parts = cleanLink.split("/");
        const targetMessageId = parseInt(parts[parts.length - 1]);
        let targetChatId: string | number;

        if (parts[0] === "c") {
            targetChatId = parseInt(`-100${parts[1]}`);
        } else {
            targetChatId = `@${parts[0]}`;
        }

        if (emoji) {
            await ctx.api.setMessageReaction(targetChatId, targetMessageId, [{ type: "emoji", emoji: emoji as any }]);
            await ctx.reply(`✅ Встановлено ${emoji} по лінку!`);
        } else {
            await ctx.api.setMessageReaction(targetChatId, targetMessageId, []);
            await ctx.reply("✅ Реакцію видалено по лінку!");
        }
    } catch (e: any) {
        await ctx.reply(`❌ Помилка: ${e.message}`);
    }
    await next();
});

userCustomComposer.on("message", async (ctx, next) => {
    if (!ctx.from) return await next();
    const userId = ctx.from.id;
    const chatId = String(ctx.chat.id);

    if (chatId in CHATS_CONFIG) {
        const chatConfig = CHATS_CONFIG[chatId];

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
        await next();
    }
});

interface ParseContext {
    chat: { id: number; };
    message: { message_id: number; };
}

async function parseMessage(ctx: ParseContext & Context, config: UserConfig) {
    const chatId = String(ctx.chat.id);
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