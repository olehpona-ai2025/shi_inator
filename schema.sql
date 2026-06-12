DROP TABLE IF EXISTS week_stats;
DROP TABLE IF EXISTS bot_messages;
CREATE TABLE week_stats (
    msg_id INTEGER,
    chat_id INTEGER,
    author_id INTEGER,
    author_nickname TEXT,
    score INTEGER DEFAULT 0,
    PRIMARY KEY (chat_id, msg_id)
)

CREATE TABLE bot_messages (
    msg_id INTEGER NOT NULL,
    chat_id INTEGER NOT NULL,
    PRIMARY KEY (msg_id, chat_id)
)