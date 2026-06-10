export interface MessageCreationData {
    message_id: number; chat_id: number; author_id: number; author_name: string;
}

export async function addNewMessage(db: D1Database, data: MessageCreationData) {
    return db.prepare(
        "INSERT OR IGNORE INTO week_stats (msg_id, chat_id, author_id, author_nickname) VALUES (?, ?, ?, ?)"
    ).bind(data.message_id, data.chat_id, data.author_id, data.author_name).run()
}

export async function storeBotMessage(db: D1Database, message_id: number, chat_id: number) {
    return db.prepare(
        "INSERT OR IGNORE INTO bot_messages (msg_id, chat_id) VALUES (?, ?)"
    ).bind(message_id, chat_id).run()
}

export async function getBotMessages(db: D1Database): Promise<{ msg_id: number; chat_id: number }[]> {
    const { results } = await db.prepare(
        "DELETE FROM bot_messages RETURNING msg_id, chat_id"
    ).all<{ msg_id: number; chat_id: number }>();
    return results;
}

export async function updateMessageScore(db: D1Database, chat_id: number, msg_id: number, author_id: number, score: number) {
    return db.prepare(
        "UPDATE week_stats SET score = score + ? WHERE chat_id = ? AND msg_id = ? AND author_id != ?"
    ).bind(score, chat_id, msg_id, author_id).run()
}

export interface DataResult {
    name: string;
    score: number;
}


export async function getChatStats(db: D1Database, chat_id: number): Promise<DataResult[]> {
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