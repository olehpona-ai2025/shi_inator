interface ActionConfig {
  sticker?: string;
  text?: string;
  animation?: string;
  reaction?: string;
  random?: number;
  timeout?: number;
  reply?: boolean;
}

type ActionChatConfig = Record<number, ActionConfig[]>;
type QuestionAnswerChatConfig = boolean;

interface ReactionConfig {
  map: Record<string, number>;
}
type ClearDickGrowerBotChatConfig = boolean;

interface ChatConfig {
  customActions?: ActionChatConfig;
  questionAnswer?: QuestionAnswerChatConfig;
  reactions?: ReactionConfig;
  clearDickGrowerBot?: ClearDickGrowerBotChatConfig;
}

interface Config {
  chats: Record<number, ChatConfig>;
  admins: Set<number>;
}

const defaultReactionMap = {
  "👍": 1,
  "❤": 1,
  "🔥": 1,
  "🥰": 1,
  "👏": 1,
  "😁": 1,
  "🎉": 1,
  "🤩": 1,
  "🙏": 1,
  "🕊️": 1,
  "🐳": 1,
  "⚡": 1,
  "🤯": 1,
  "💯": 1,
  "❤‍🔥": 1,
  "👎": -1,
  "💩": -1,
  "🤮": -2,
  "🤦": -1,
  "🤬": -1,
  "🖕": -1,
  "💔": -1,
  "🤡": -2,
};

const config: Config = {
  admins: new Set([1157828407]),
  chats: {
    [-1002750833285]: {
      clearDickGrowerBot: true,
      questionAnswer: true,
      reactions: {
        map: defaultReactionMap,
      },
      customActions: {
        [1043033198]: [{ reaction: "🤡", random: 30, timeout: 10 }],
        [1125505843]: [{ reaction: "🔥" }],
        [1979765201]: [{ reaction: "🏆" }],
        [5923340571]: [{ reaction: "😍" }],
      },
    },
    [-1003545584995]: {
      questionAnswer: true,
      customActions: {
        [534062947]: [
          {
            sticker:
              "CAACAgIAAxkBAAOXaWfvXGwuOBTV0Csy1yb5F9ldo44AAiFaAAJE2OFIDpOkrA4hvX04BA",
            reply: true,
          },
        ],
        [1125505843]: [{ reaction: "🔥" }],
        [1979765201]: [{ reaction: "🏆" }],
        [5923340571]: [{ reaction: "😍" }],
      },
    },
    [-4919067380]: {
      questionAnswer: true,
      customActions: {
        [1125505843]: [{ reaction: "🔥" }],
        [1157828407]: [{ reaction: "🤡" }],
        [1979765201]: [{ reaction: "🏆" }],
        [5923340571]: [{ reaction: "😍" }],
      },
    },
    [-1003510672503]: {
      questionAnswer: true,
      reactions: {
        map: defaultReactionMap,
      },
      clearDickGrowerBot: true,
      customActions: {
        [1157828407]: [{ reaction: "🤡", timeout: 2 }],
      },
    },
  },
};

export { config, ActionConfig, ChatConfig };
