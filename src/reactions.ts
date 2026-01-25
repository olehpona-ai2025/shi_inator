import { Bot, Composer, InlineKeyboard } from "grammy"
import { CfContext } from "./types";
import { ADMIN_ID } from "./const";

const ReactionComposer = new Composer<CfContext>();

const ALLOWED_CHATS = new Set([
    "-1002750833285"
]);

const REACTION_VALUES: Record<string, number> = {
    "👍": 1, "❤": 1, "🔥": 1, "🥰": 1, "👏": 1, "😁": 1, "🎉": 1, "🤩": 1, "🙏": 1, "🕊️": 1, "🐳": 1, "⚡": 1, "🤯": 1, "💯": 1,
    "👎": -1, "💩": -1, "🤮": -2, "🤦": -1, "🤬": -1, "🖕": -1, "💔": -1,
    "🤡": -2
};

export function calculateReactionValue(reactions: string[]): number {
    return reactions.reduce((acc, reaction) => acc + (REACTION_VALUES[reaction] || 0), 0);
}

ReactionComposer.on("message_reaction", async (ctx, next) => {
    const isUser = ctx.messageReaction.user && !ctx.messageReaction.user.is_bot;
    const isAllowedChat = ALLOWED_CHATS.has(String(ctx.messageReaction.chat.id));

    if (!isUser || !isAllowedChat) {
        await next();
        return;
    };

    let old_reactions = calculateReactionValue(ctx.messageReaction.old_reaction.map((reaction) => reaction.type == "emoji" ? reaction.emoji : ""));
    let new_reactions = calculateReactionValue(ctx.messageReaction.new_reaction.map((reaction) => reaction.type == "emoji" ? reaction.emoji : ""));

    ctx.executionCtx.waitUntil(ctx.db.prepare(
        "UPDATE week_stats SET score = score + ? WHERE chat_id = ? AND msg_id = ?"
    ).bind(new_reactions - old_reactions, ctx.messageReaction.chat.id, ctx.messageReaction.message_id).run());
    await next();
});

ReactionComposer.on("message", async (ctx, next) => {
    if (ctx.from?.is_bot) {
        await next();
        return;
    }

    if (!ALLOWED_CHATS.has(String(ctx.chat.id))) {
        await next();
        return;
    }

    ctx.executionCtx.waitUntil(ctx.db.prepare(
        "INSERT OR IGNORE INTO week_stats (msg_id, chat_id, author_id, author_nickname) VALUES (?, ?, ?, ?)"
    ).bind(ctx.message.message_id, ctx.chat.id, ctx.from.id, ctx.from.username || ctx.from.first_name).run());
    await next();
});



interface DataResult {
    name: string;
    score: number;
}

async function getData(db: D1Database, chat_id: string): Promise<DataResult[]> {
    const query = `
    WITH UserScores AS (
        SELECT 
            author_nickname as name, 
            SUM(score) as score
        FROM week_stats 
        WHERE chat_id = ? 
        GROUP BY author_id
    )
    
    SELECT * FROM (
        SELECT * FROM UserScores ORDER BY score DESC LIMIT 5
    )
    UNION
    SELECT * FROM (
        SELECT * FROM UserScores WHERE score < 0 ORDER BY score ASC LIMIT 5
    )
    
    ORDER BY score DESC;
    `;

    const { results } = await db.prepare(query).bind(chat_id).all<DataResult>();
    return results;
}

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
    if (ctx.chat.id != ADMIN_ID) {
        await next();
        return;
    };

    const match = ctx.match as string;
    const args = match ? match.split(/\s+/) : [];

    if (args.length < 1) {
        await ctx.reply("❌ Будь ласка, вкажи ID чату.");
        return;
    }

    const chatId = args[0];
    const data = await getData(ctx.db, chatId);
    if (data.length === 0) {
        await ctx.reply("❌ Немає даних для цього чату.");
        return;
    }

    const inlineKeyboard = new InlineKeyboard()
        .webApp("Деталі", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    const statsMessage = buildStatsMessage(data);
    await ctx.reply(statsMessage, { parse_mode: "Markdown", reply_markup: inlineKeyboard });
    await next();
});

async function sendStatsToAllowedChats(bot: Bot<CfContext>, d1: D1Database) {
    for (const chatId of ALLOWED_CHATS) {
        const data = await getData(d1, chatId);
        if (data.length === 0) {
            continue;
        }
        const statsMessage = buildStatsMessage(data);
        try {

            const inlineKeyboard = new InlineKeyboard()
                .webApp("Деталі", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            await bot.api.sendMessage(chatId, statsMessage, { parse_mode: "Markdown", reply_markup: inlineKeyboard });
        } catch (e) {
            console.error(`❌ Помилка при відправці статистики до чату ${chatId}:`, e);
        }
    }
}

export { ReactionComposer, sendStatsToAllowedChats };