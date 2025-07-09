import { openDb } from '../db.js';

export async function createNoteDB({ user_id, title, content }) {
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
    user_id, title, content
  );
  return { id: result.lastID, user_id, title, content };
}

export async function getNotesDB(user_id) {
  const db = await openDb();
  return db.all('SELECT * FROM notes WHERE user_id = ?', user_id);
}

export async function getNoteDB(id, user_id) {
  const db = await openDb();
  return db.get('SELECT * FROM notes WHERE id = ? AND user_id = ?', id, user_id);
}

export async function updateNoteDB(id, user_id, { title, content }) {
  const db = await openDb();
  await db.run(
    'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    title, content, id, user_id
  );
}

export async function deleteNoteDB(id, user_id) {
  const db = await openDb();
  await db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', id, user_id);
} 