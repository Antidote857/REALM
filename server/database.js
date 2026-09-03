import Database from 'better-sqlite3'

const db = new Database('realm.db')

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (conversation_id)
      REFERENCES conversations(id)
      ON DELETE CASCADE
  );
`)

export default db