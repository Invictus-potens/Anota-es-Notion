// src/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Função para abrir o banco de dados SQLite
export async function openDb() {
  return open({
    filename: './dev.sqlite', // O arquivo do banco ficará na raiz do projeto
    driver: sqlite3.Database
  });
}

// Criação das tabelas (chame isso no início do app)
export async function initDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      notion_page_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  return db;
}