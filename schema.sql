DROP TABLE IF EXISTS week_stats;
CREATE TABLE week_stats (
    msg_id INTEGER,
    chat_id INTEGER,
    author_id INTEGER,
    author_nickname TEXT,
    score INTEGER DEFAULT 0,
    PRIMARY KEY (chat_id, msg_id)
);