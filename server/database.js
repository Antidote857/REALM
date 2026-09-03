import Database from 'better-sqlite3'

const db = new Database('realm.db')

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  context_key TEXT NOT NULL,
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

const conversationColumns = db
  .prepare(`PRAGMA table_info(conversations)`)
  .all()

const hasContextKey = conversationColumns.some(
  (column) => column.name === 'context_key'
)

if (!hasContextKey) {
  db.exec(`
    ALTER TABLE conversations
    ADD COLUMN context_key TEXT NOT NULL DEFAULT 'global'
  `)

  console.log(
    'REALM database migration: added conversations.context_key'
  )
}

export default db