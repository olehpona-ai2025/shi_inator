import { Bot, Context, webhookCallback } from "grammy";

interface ActionConfig {
    sticker?: string;
    text?: string;
    animation?: string;
    reaction?: string;
    reply?: boolean; // Чи відповідати реплаєм, чи просто писати в чат
}

// Конфігурація юзера:
// 1. Може мати глобальні дії (наслідує ActionConfig)
// 2. Може мати специфічні оверрайди для чатів
interface UserConfig extends ActionConfig {
    chats?: Record<string, ActionConfig>;
}

// Інтерфейс змінних оточення
interface Env {
    BOT_TOKEN: string;
}

// --- Конфігурація ---

const USER_CONFIG: Record<number, UserConfig> = {
    5923340571: {
        reaction: "😍"
    },
    1157828407: {
        reaction: "🤡"
    },
    1125505843: {
        reaction: "🔥"
    },
    534062947: {
        // Тут можуть бути глобальні налаштування, наприклад:
        // reaction: "👍", 
        chats: {
            "-1003545584995": {
                sticker: "CAACAgIAAxkBAAOXaWfvXGwuOBTV0Csy1yb5F9ldo44AAiFaAAJE2OFIDpOkrA4hvX04BA",
                reply: true
                // Цей стікер спрацює тільки в цьому чаті
            }
        }
    }
};

const ADMIN_ID = 1157828407;

// --- Основна логіка ---

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const bot = new Bot(env.BOT_TOKEN);

        // 1. Команда /start
        bot.command("start", async (ctx) => {
            await ctx.reply(`Привіт! Твій ID: ${ctx.from?.id}`);
        });

        // 2. Команда /send (Admin)
        bot.command("send", async (ctx) => {
            if (ctx.from?.id !== ADMIN_ID) return;

            const match = ctx.match as string;
            const args = match ? match.split(/\s+/) : [];

            if (args.length === 0 && !ctx.message?.reply_to_message) {
                return ctx.reply("Помилка: вкажи ID чату або зроби реплай і обери кнопку.");
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
        });

        // 3. Команда /react (Admin)
        bot.command("react", async (ctx) => {
            if (ctx.from?.id !== ADMIN_ID) return;

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
                        if (emoji) await await ctx.api.setMessageReaction(ctx.message.reply_to_message.chat.id, ctx.message.reply_to_message.message_id, [
                            { type: "emoji", emoji: emoji as any },
                        ]);
                        return ctx.reply("✅ Готово (локально).");
                    } catch (e: any) {
                        return ctx.reply(`Error: ${e.message}`);
                    }
                }
            }

            if (!link) return ctx.reply("❌ Не знайшов посилання на повідомлення.");

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
        });

        // 4. Debug Tool (Private)
        const pm = bot.chatType("private");
        pm.on("message", async (ctx, next) => {
            if (ctx.message.text?.startsWith("/")) return next();

            const userId = ctx.from.id;
            let responseText = `👤 **Твій User ID:** \`${userId}\``;

            if (ctx.message.sticker) {
                responseText += `\n\n🤡 **Sticker ID:**\n\`${ctx.message.sticker.file_id}\``;
            }
            if (ctx.message.animation) {
                responseText += `\n\n🎬 **GIF ID:**\n\`${ctx.message.animation.file_id}\``;
            }

            await ctx.reply(responseText, { parse_mode: "Markdown" });
            return next();
        });

        // 5. Моніторинг (Основна логіка мерджу конфігів)
        bot.on("message", async (ctx) => {
            const userId = ctx.from.id;
            const chatId = ctx.chat.id;

            if (userId in USER_CONFIG) {
                const baseConfig = USER_CONFIG[userId];

                // Створюємо фінальний конфіг: спочатку беремо глобальний
                // Використовуємо Partial<ActionConfig> щоб TS не сварився при створенні пустих об'єктів
                let config: ActionConfig = { ...baseConfig };

                // Якщо є оверрайд для цього чату, накладаємо його зверху
                if (baseConfig.chats && baseConfig.chats[String(chatId)]) {
                    config = { ...config, ...baseConfig.chats[String(chatId)] };
                }

                // Витягуємо параметри, щоб не звертатись постійно через крапку
                const { reply: shouldReply, reaction, text, sticker, animation } = config;

                // Функція відправки
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

                // Виконання дій
                if (reaction) {
                    await ctx.api.setMessageReaction(chatId, ctx.message.message_id, [
                        { type: "emoji", emoji: reaction as any },
                    ]);
                }
                if (text) await sendResponse("text", text);
                if (animation) await sendResponse("animation", animation);
                if (sticker) await sendResponse("sticker", sticker);
            }
        });
        try {
            // "cloudflare-mod" - це правильний адаптер для Workers
            return await webhookCallback(bot, "cloudflare-mod")(request);
        } catch (e: any) {
            console.error("CRITICAL ERROR:", e);
            return new Response(`Worker Error: ${e.message}`, { status: 500 });
        }
    },
};