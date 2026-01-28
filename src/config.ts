interface ActionConfig {
    sticker?: string;
    text?: string;
    animation?: string;
    reaction?: string;
    random?: number;
    timeout?: number;
    reply?: boolean;
}

interface UserConfig extends ActionConfig { }

interface ChatConfig {
    users: Record<number, UserConfig[]>;
}

interface Config {
    allowed_chats: Set<number>;
    admins: Set<number>;
    update_config: Record<number, ChatConfig>;
    reaction_map: Record<string, number>;
}

interface KvConfig {
    allowed_chats: number[];
    admins: number[];
    update_config: Record<number, ChatConfig>;
    reaction_map: Record<string, number>;
}

let config: Config;

async function loadConfig(env: Env) {
    let kv_config = await env.CONFIG.get("CONFIG", { type: 'json' }) as KvConfig;
    config = { ...kv_config, allowed_chats: new Set(kv_config.allowed_chats), admins: new Set(kv_config.admins) };
}

export { loadConfig, config, ActionConfig, UserConfig, ChatConfig };