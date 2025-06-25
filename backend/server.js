import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

import authRoutes from './routes/authRoutes.js';
import empresaRoutes from './routes/empresaRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import plantillaRoutes from './routes/plantillaRoutes.js';
import documentosRoutes from './routes/documentos.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔐 Dominio del frontend permitido (Render)
const FRONTEND_URL = 'https://genpecjusava.onrender.com';

// 🧠 Middleware CORS manual (responde a OPTIONS antes que todo)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Responder directamente las preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// 📁 Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔗 Rutas
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/plantillas', plantillaRoutes);
app.use('/api/documentos', documentosRoutes);

// 🧪 Ruta de test conexión a BD
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0] });
  } catch (error) {
    console.error('Error de conexión:', error);
    res.status(500).json({ success: false, message: 'Error de conexión' });
  }
});

// 🚀 Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor activo en puerto ${PORT}`);
});
