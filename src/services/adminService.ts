import { Api, RawApi } from "grammy";
import { ReactionType } from "grammy/types";

export async function banUserFromChat(
  api: Api<RawApi>,
  chatId: number,
  userId: number,
) {
  await api.banChatMember(chatId, userId);
}

export async function unBanUserFromChat(
  api: Api<RawApi>,
  chatId: number,
  userId: number,
) {
  await api.unbanChatMember(chatId, userId);
}

export async function copyMessageToChat(
  api: Api<RawApi>,
  targetChatId: number,
  sourceChatId: number,
  messageId: number,
) {
  await api.copyMessage(targetChatId, sourceChatId, messageId);
}

export async function sendMessageToChat(
  api: Api<RawApi>,
  chatId: number,
  text: string,
) {
  await api.sendMessage(chatId, text);
}

export async function setMessageReaction(
  api: Api<RawApi>,
  chatId: number,
  messageId: number,
  emoji: string[],
) {
  await api.setMessageReaction(
    chatId,
    messageId,
    emoji.map((e) => ({ type: "emoji", emoji: e }) as ReactionType),
  );
}

export async function removeMessage(
  api: Api<RawApi>,
  chatId: number,
  messageId: number,
) {
  await api.deleteMessage(chatId, messageId);
}
