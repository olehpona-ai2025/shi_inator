import { config } from "@/config";
import {
  getChatStats,
  ReactionCountResult,
  updateMessageScore,
} from "@/db/reactionsRepository";
import { DbClient } from "@/db/types";
import { escapeMd } from "@/utils/md";
import { Api, RawApi } from "grammy";
import { MessageReactionUpdated } from "grammy/types";

export function buildStatsMessage(data: ReactionCountResult[]): string {
  let responseText = `📊 **Тижневі Статистики:**\nНа основі реакцій під повідомленнями\n\n`;
  const leaders = data.filter((u) => u.score >= 0);
  if (leaders.length > 0) {
    responseText += "🏆 **Герої сьогодення:**\n";
    leaders.forEach(
      (u, i) =>
        (responseText += `${i + 1}. @${escapeMd(u.name)}: *${u.score}*\n`),
    );
  }
  const losers = data.filter((u) => u.score < 0).reverse();
  if (losers.length > 0) {
    responseText += "\n🤡 **Крінж-відділ:**\n";
    losers.forEach(
      (u, i) =>
        (responseText += `${i + 1}. @${escapeMd(u.name)}: *${u.score}*\n`),
    );
  }
  return responseText;
}

export async function sendStats(
  api: Api<RawApi>,
  db: DbClient,
  chatId: number,
) {
  const data = await getChatStats(db, chatId);
  if (data.length === 0) {
    return;
  }
  const statsMessage = buildStatsMessage(data);
  try {
    await api.sendMessage(chatId, statsMessage, {
      parse_mode: "Markdown",
    });
  } catch (e) {
    console.error(`❌ Помилка при відправці статистики до чату ${chatId}:`, e);
  }
}

export async function sendStatsToAllowedChats(api: Api<RawApi>, db: DbClient) {
  for (const [chatId, chatConfig] of Object.entries(config.chats)) {
    if (chatConfig.reactions !== undefined) {
      await sendStats(api, db, Number(chatId));
    }
  }
}

function calculateReactionValue(
  reactions: MessageReactionUpdated["new_reaction"],
  chatId: number,
): number {
  const reactionMap = config.chats[chatId]?.reactions?.map || {};
  return reactions.reduce((totalScore, reaction) => {
    if (reaction.type === "emoji") {
      const emojiValue = reactionMap[reaction.emoji] || 0;
      return totalScore + emojiValue;
    }

    return totalScore;
  }, 0);
}

export async function updateMessageScoreOnReactionChange(
  db: DbClient,
  chatId: number,
  messageId: number,
  userId: number,
  oldReaction: MessageReactionUpdated["old_reaction"],
  newReaction: MessageReactionUpdated["new_reaction"],
) {
  const oldScore = calculateReactionValue(oldReaction, chatId);
  const newScore = calculateReactionValue(newReaction, chatId);
  const delta = newScore - oldScore;
  if (delta === 0) return;

  await updateMessageScore(db, { chatId, messageId, authorId: userId, delta });
}
