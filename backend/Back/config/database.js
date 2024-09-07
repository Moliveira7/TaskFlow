import sqlite3 from 'sqlite3';

// Criação ou conexão com o banco de dados SQLite
const db = new sqlite3.Database('./database.db');

// Criar tabelas, se não existirem
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0,
        user_email TEXT NOT NULL,
        FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
    )`);
});

export default db;
