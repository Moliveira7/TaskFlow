import sqlite3 from 'sqlite3';
import { resolve } from 'path';

// Criação ou conexão com o banco de dados SQLite no caminho correto
const dbPath = resolve('./database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criar tabelas, se não existirem
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela users:', err.message);
        } else {
            console.log('Tabela users criada ou já existe.');
        }
    });

    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0,
        user_email TEXT NOT NULL,
        FOREIGN KEY (user_email) REFERENCES users (email) ON DELETE CASCADE
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela tasks:', err.message);
        } else {
            console.log('Tabela tasks criada ou já existe.');
        }
    });
});

export default db;
