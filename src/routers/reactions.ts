import { Bot, Composer, InlineKeyboard } from "grammy"
import { CfContext } from "@/types";
import { config } from "@/config";
import { addNewMessage, DataResult, getChatStats, updateMessageScore } from "@/db";

const ReactionComposer = new Composer<CfContext>();

export function calculateReactionValue(reactions: string[]): number {
    return reactions.reduce((acc, reaction) => acc + (config.reaction_map[reaction] || 0), 0);
}

ReactionComposer.on("message_reaction", async (ctx, next) => {
    const isUser = ctx.messageReaction.user && !ctx.messageReaction.user.is_bot;
    const isAllowedChat = config.allowed_chats.has(ctx.messageReaction.chat.id);

    if (!isUser || !isAllowedChat) {
        await next();
        return;
    };

    let old_reactions = calculateReactionValue(ctx.messageReaction.old_reaction.map((reaction) => reaction.type == "emoji" ? reaction.emoji : ""));
    let new_reactions = calculateReactionValue(ctx.messageReaction.new_reaction.map((reaction) => reaction.type == "emoji" ? reaction.emoji : ""));

    ctx.executionCtx.waitUntil(updateMessageScore(ctx.db, ctx.messageReaction.chat.id, ctx.messageReaction.message_id, new_reactions - old_reactions));
    await next();
});

ReactionComposer.on("message", async (ctx, next) => {
    if (ctx.from?.is_bot) {
        await next();
        return;
    }

    if (!config.allowed_chats.has(ctx.chat.id)) {
        await next();
        return;
    }

    ctx.executionCtx.waitUntil(addNewMessage(ctx.db, {
        message_id: ctx.message.message_id,
        chat_id: ctx.chat.id,
        author_id: ctx.from.id,
        author_name: ctx.from.username || ctx.from.first_name
    }));
    await next();
});

function escapeMd(text: string): string {
    return text.replace(/[_*[\]`]/g, '\\$&');
}

function buildStatsMessage(data: DataResult[]): string {
    let responseText = `📊 **Тижневі Статистики:**\nНа основі реакцій під повідомленнями\n\n`;
    const leaders = data.filter(u => u.score >= 0);
    if (leaders.length > 0) {
        responseText += "🏆 **Герої сьогодення:**\n";
        leaders.forEach((u, i) => responseText += `${i + 1}. @${escapeMd(u.name)}: *${u.score}*\n`);
    }
    const losers = data.filter(u => u.score < 0).reverse();
    if (losers.length > 0) {
        responseText += "\n🤡 **Крінж-відділ:**\n";
        losers.forEach((u, i) => responseText += `${i + 1}. @${escapeMd(u.name)}: *${u.score}*\n`);
    }
    return responseText;
}

ReactionComposer.chatType("private").command("weekstats", async (ctx, next) => {
    if (!config.admins.has(ctx.chat.id)) {
        await next();
        return;
    };

    const match = ctx.match as string;
    const args = match ? match.split(/\s+/) : [];

    if (args.length < 1) {
        await ctx.reply("❌ Будь ласка, вкажи ID чату.");
        await next();
        return;
    }

    const chatId = args[0];
    const data = await getChatStats(ctx.db, Number(chatId));
    if (data.length === 0) {
        await ctx.reply("❌ Немає даних для цього чату.");
        await next();
        return;
    }

    const inlineKeyboard = new InlineKeyboard()
        .url("Деталі", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    const statsMessage = buildStatsMessage(data);
    await ctx.reply(statsMessage, { parse_mode: "Markdown", reply_markup: inlineKeyboard });
    await next();
});

interface SendTrait {
    sendMessage: (chat_id: number, text: string, other: any) => Promise<any>
}

async function sendStats(bot: SendTrait, d1: D1Database, chatId: number) {
    const data = await getChatStats(d1, chatId);
    if (data.length === 0) {
        return;
    }
    const statsMessage = buildStatsMessage(data);
    try {

        const inlineKeyboard = new InlineKeyboard()
            .url("Деталі", "https://www.youtube.com/watch?v=mHJ3l18YqNM");
        await bot.sendMessage(chatId, statsMessage, { parse_mode: "Markdown", reply_markup: inlineKeyboard });
    } catch (e) {
        console.error(`❌ Помилка при відправці статистики до чату ${chatId}:`, e);
    }
}

ReactionComposer.chatType("private").command("manual_weekstats", async (ctx, next) => {
    if (!config.admins.has(ctx.chat.id)) {
        await next();
        return;
    };
    for (let chat_id of config.allowed_chats) {
        await sendStats(ctx.api, ctx.db, chat_id);
    }
    await next();
});

async function sendStatsToAllowedChats(bot: SendTrait, d1: D1Database) {
    for (let chat_id of config.allowed_chats) {
        await sendStats(bot, d1, chat_id);
    }
}

export { ReactionComposer, sendStatsToAllowedChats };