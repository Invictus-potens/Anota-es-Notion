import express from 'express';
import dotenv from 'dotenv';
import notesRoutes from './routes/notes.js';
import authRoutes from './routes/auth.js';
import './db.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/notes', notesRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API Notion Notes App rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 