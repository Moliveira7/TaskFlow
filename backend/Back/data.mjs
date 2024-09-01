import sqlite3 from 'sqlite3';

// Criação ou conexão com o banco de dados SQLite
const db = new sqlite3.Database('./database.db');

// Criar a tabela de usuários se não existir
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);
});

export default db;