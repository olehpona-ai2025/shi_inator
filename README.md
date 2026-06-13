# 🚀 shi-inator

`shi-inator` is a high-performance Telegram bot powered by **Cloudflare Workers**, designed to track community interactions, manage reactions, and generate automated statistics. 

Built with a clean, layered architecture, it leverages the edge to provide ultra-low latency responses and reliable scheduled tasks.

## ✨ Features

- 📊 **Reaction Analytics**: Tracks emoji reactions to determine the "Heroes" (most praised) and the "Cringe Department" (most roasted) of the chat.
- ⚡ **Edge Runtime**: Deployed on Cloudflare Workers for maximum scalability and speed.
- 📅 **Smart Cron Dispatcher**: Automated scheduled jobs for weekly statistics and system maintenance.
- 🛠️ **Admin Control**: Dedicated admin commands to manually trigger reports and manage the bot.
- 🛡️ **Flexible Configuration**: Easy-to-adjust reaction values and chat permissions.

## 🛠 Tech Stack

- **Language:** TypeScript
- **Bot Framework:** [grammy](https://grammy.dev/)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Platform:** [Cloudflare Workers](https://workers.cloudflare.com/)

## 🏗 Architecture

The project follows a strict separation of concerns to ensure maintainability:

`Router` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Database`

- **Routers (`src/routers`)**: Handle Telegram events and input validation.
- **Services (`src/services`)**: Contain the core business logic and coordinate between repositories.
- **Repositories (`src/db`)**: Abstract the data access layer using Drizzle ORM.
- **Cron Dispatcher (`src/cron`)**: Routes scheduled Cloudflare events to specific task functions.

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- A Cloudflare account with D1 enabled.

### Installation
1. Clone the repository.
2. Install dependencies:
    ```bash
    bun install
    ```

### Configuration
Update `src/config.ts` with your chat IDs and preferred reaction mappings. Configure your `wrangler.toml` with your `BOT_TOKEN` and D1 database ID.

### Development & Deployment

**Local Development:**
```bash
bun run dev # or bunx wrangler dev
```

**Deployment:**
```bash
bun run deploy-dev  # Deploy to the development environment
bun run deploy-prod # Deploy to production
```

## 📁 Project Structure

```text
src/
├── cron/        # Scheduled tasks and dispatcher
├── db/          # Drizzle schema and database repositories
├── routers/     # Telegram event handlers (Composers)
├── services/    # Business logic
├── utils/       # Helper functions
├── config.ts    # Bot configuration
└── index.ts     # Worker entry point
```

## 📜 License
MIT
