import { pool } from '../db.js';

export async function createNoteDB({ user_id, title, content, notion_page_id }) {
  const [result] = await pool.query(
    'INSERT INTO notes (user_id, title, content, notion_page_id) VALUES (?, ?, ?, ?)',
    [user_id, title, content, notion_page_id]
  );
  return { id: result.insertId, user_id, title, content, notion_page_id };
}

export async function getNotesDB(user_id) {
  const [rows] = await pool.query('SELECT * FROM notes WHERE user_id = ?', [user_id]);
  return rows;
}

export async function getNoteDB(id, user_id) {
  const [rows] = await pool.query('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, user_id]);
  return rows[0];
}

export async function updateNoteDB(id, user_id, { title, content }) {
  await pool.query('UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?', [title, content, id, user_id]);
}

export async function deleteNoteDB(id, user_id) {
  await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, user_id]);
} 