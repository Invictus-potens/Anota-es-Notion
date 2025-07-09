import {
  createNoteDB,
  getNotesDB,
  getNoteDB,
  updateNoteDB,
  deleteNoteDB
} from '../models/noteModel.js';

export async function createNote(req, res) {
  const { title, content } = req.body;
  const user_id = req.user.id;
  if (!title) return res.status(400).json({ message: 'Título obrigatório' });
  try {
    // Salva apenas no SQLite
    const note = await createNoteDB({ user_id, title, content });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar nota', error: err.message });
  }
}

export async function getNotes(req, res) {
  const user_id = req.user.id;
  try {
    const notes = await getNotesDB(user_id);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar notas', error: err.message });
  }
}

export async function getNote(req, res) {
  const user_id = req.user.id;
  const { id } = req.params;
  try {
    const note = await getNoteDB(id, user_id);
    if (!note) return res.status(404).json({ message: 'Nota não encontrada' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar nota', error: err.message });
  }
}

export async function updateNote(req, res) {
  const user_id = req.user.id;
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const note = await getNoteDB(id, user_id);
    if (!note) return res.status(404).json({ message: 'Nota não encontrada' });
    await updateNoteDB(id, user_id, { title, content });
    res.json({ message: 'Nota atualizada' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar nota', error: err.message });
  }
}

export async function deleteNote(req, res) {
  const user_id = req.user.id;
  const { id } = req.params;
  try {
    const note = await getNoteDB(id, user_id);
    if (!note) return res.status(404).json({ message: 'Nota não encontrada' });
    await deleteNoteDB(id, user_id);
    res.json({ message: 'Nota deletada' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao deletar nota', error: err.message });
  }
} 