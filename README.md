# 🦆 SHI_INATOR 3000 (The Bot That Judges You) 🤖

Yo, welcome to **shi_inator**. It's not a toaster, it's not a bird, it's a **Telegram Bot** that runs on the edge (literally, it's on Cloudflare Workers) and silently judges everyone in your chat. 🌩️✨

If you are reading this, you probably messed up or you are pure genius. No in-between. 🤷‍♂️

## 🧐 What does it do?

It basically manages your chat's "Social Credit" score but make it meme-able.

### 1. 📊 The Judge (Week Stats)

Every time someone reacts to a message, **shi_inator** takes notes. 📝

- Got a 🔥? `+Score` 📈
- Got a 🤡? `-Score` 📉 (Welcome to the **Cringe Department**)

At the end of the week (or when I feel like it), it drops a leaderboard exposing who is the real **Hero** and who is absolute **Cringe**. Includes a free Rickroll for extra emotional damage. 🎵🕺

### 2. 🎭 The Auto-Troll (User Custom)

You can configure this bad boy to **automatically bully** (or praise, I guess?) specific users.

- Want to reply with a sticker every time "that one guy" talks? Done.
- Want to add a 🌭 reaction to every message from your bestie? Easy.
- Supports `random` chance because life is unpredictable. 🎲

### 3. 👮 GOD MODE (Admin Tools)

For the admins who have control issues:

- `/send <chat_id> <text>` - Speak through the bot like a ventriloquist. 🗣️
- `/react <emoji> <link>` - React to any message from the shadows. 🕵️‍♂️
- `/manual_weekstats` - Force the judgment day immediately. ⚖️

---

## 🛠️ Tech Stack (The Boring Stuff)

- **Language:** TypeScript (because we have standards... mostly) 🦕
- **Runtime:** Cloudflare Workers (Fast as boi) ⚡
- **Framework:** `grammy` (The best one, don't @ me)
- **Database:** Cloudflare D1 (SQL goes brrr) 💾
- **Config:** Cloudflare KV (JSON magic) 🔑
- **PackageManager:** Bun 🍞

---

## 🚀 How to Run This Dumpster Fire

1. **Clone it.** (Duh)
2. **Install deps:**
   ```bash
   bun install
   ```
3. **Pray to the Cloudflare gods.** 🙏
4. **Deploy:**
   ```bash
   bun run deploy
   ```

## ⚙️ Configuration (JSON is my passion)

You need to put a JSON into your Cloudflare KV under the key `CONFIG`. It looks something like this chaos:

```json
{
  "allowed_chats": [-1001234567890],
  "admins": [123456789],
  "reaction_map": {
    "👍": 10,
    "🔥": 50,
    "🤡": -500,
    "💩": -1000
  },
  "update_config": {
    "-1001234567890": {
      "users": {
        "987654321": [{ "text": "Why are you like this?", "random": 10 }]
      }
    }
  }
}
```

---

## 📜 Disclaimer

This bot is provided "as is". If it bans your grandma or insults your boss, that's a _feature_, not a bug. 🐛❌ -> 🐛✅

Made with 💔 and ☕.
