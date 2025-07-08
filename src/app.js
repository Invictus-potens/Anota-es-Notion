import express from 'express';
import dotenv from 'dotenv';
import notesRoutes from './routes/notes.js';
import authRoutes from './routes/auth.js';
import './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../public')));

const app = express();
app.use(express.json());

app.use('/notes', notesRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 