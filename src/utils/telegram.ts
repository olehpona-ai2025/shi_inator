export function parseTelegramLink(link: string): {
  chatId: string | number;
  messageId: number;
} {
  const cleanLink = link
    .replace("https://", "")
    .replace("http://", "")
    .replace("t.me/", "");
  const parts = cleanLink.split("/");
  const targetMessageId = parseInt(parts[parts.length - 1]);
  let targetChatId: string | number;

  if (parts[0] === "c") {
    targetChatId = parseInt(`-100${parts[1]}`);
  } else {
    targetChatId = `@${parts[0]}`;
  }

  return { chatId: targetChatId, messageId: targetMessageId };
}
