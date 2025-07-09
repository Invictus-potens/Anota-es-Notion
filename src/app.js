import express from 'express';
import dotenv from 'dotenv';
import notesRoutes from './routes/notes.js';
import authRoutes from './routes/auth.js';
import { initDb } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/notes', notesRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/create-note', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/create-note.html'));
});

const PORT = process.env.PORT || 3000;

// Initialize database before starting server
async function startServer() {
  try {
    await initDb();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer(); 