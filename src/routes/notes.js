import express from 'express';
import { createNote, getNotes, getNote, updateNote, deleteNote } from '../controllers/notesController.js';
import { authenticate } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { saveAttachment, getAttachmentsByNote, getAttachment } from '../services/fileService.js';
import fs from 'fs';

const router = express.Router();

router.use(authenticate);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload de anexo para uma nota
router.post('/:id/attachments', upload.single('file'), async (req, res) => {
  const note_id = req.params.id;
  if (!req.file) return res.status(400).json({ message: 'Arquivo não enviado' });
  const filename = req.file.originalname;
  const filepath = req.file.path;
  try {
    const attachment = await saveAttachment({ note_id, filename, filepath });
    res.status(201).json(attachment);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar anexo', error: err.message });
  }
});

// Listar anexos de uma nota
router.get('/:id/attachments', async (req, res) => {
  const note_id = req.params.id;
  try {
    const attachments = await getAttachmentsByNote(note_id);
    res.json(attachments);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar anexos', error: err.message });
  }
});

// Download de anexo
router.get('/attachments/:attachmentId', async (req, res) => {
  const { attachmentId } = req.params;
  try {
    const attachment = await getAttachment(attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Anexo não encontrado' });
    res.download(path.resolve(attachment.filepath), attachment.filename);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao baixar anexo', error: err.message });
  }
});

export default router; 