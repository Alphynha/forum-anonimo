const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DB_DIR, 'forum.db');

if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log('[DB] Diretório criado:', DB_DIR);
}

const db = new Database(DB_PATH);

console.log(`[DB] Conectado ao banco de dados: ${DB_PATH}`);

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

console.log('[DB] Tabela "posts" verificada/criada com sucesso.');

db.pragma('journal_mode = WAL');

module.exports = db;