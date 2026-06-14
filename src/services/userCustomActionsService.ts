import { ActionConfig } from "@/config";
import { Api, RawApi } from "grammy";
import { ReactionType } from "grammy/types";

async function sendResponse(
  api: Api<RawApi>,
  chatId: number,
  messageId: number,
  config: ActionConfig,
) {
  const replyParameters = {
    reply_parameters: config.reply ? { message_id: messageId } : undefined,
  };
  if (config.text) {
    await api.sendMessage(chatId, config.text, replyParameters);
  } else if (config.sticker) {
    await api.sendSticker(chatId, config.sticker, replyParameters);
  } else if (config.animation) {
    await api.sendAnimation(chatId, config.animation, replyParameters);
  } else if (config.reaction) {
    await api.setMessageReaction(chatId, messageId, [
      { type: "emoji", emoji: config.reaction } as ReactionType,
    ]);
  } else if (config.deleteMessage) {
    await api.deleteMessage(chatId, messageId);
  }
}

export async function parseMessage(
  api: Api<RawApi>,
  chatId: number,
  messageId: number,
  configs: ActionConfig[],
) {
  for (const config of configs) {
    const { random, timeout } = config;

    if (random && Math.random() * 100 > random) return;
    if (timeout) {
      await (async () => {
        const delay = Math.min(timeout, 10) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        await sendResponse(api, chatId, messageId, config);
      })();
    } else {
      await sendResponse(api, chatId, messageId, config);
    }
  }
}
