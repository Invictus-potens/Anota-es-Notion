import { openDb } from '../db.js';

export async function saveAttachment({ note_id, filename, filepath }) {
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO attachments (note_id, filename, filepath) VALUES (?, ?, ?)',
    note_id, filename, filepath
  );
  return { id: result.lastID, note_id, filename, filepath };
}

export async function getAttachmentsByNote(note_id) {
  const db = await openDb();
  return db.all('SELECT * FROM attachments WHERE note_id = ?', note_id);
}

export async function getAttachment(id) {
  const db = await openDb();
  return db.get('SELECT * FROM attachments WHERE id = ?', id);
} 