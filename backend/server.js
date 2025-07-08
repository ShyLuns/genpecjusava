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

// ✅ PRIMERA CAPA: Middleware CORS global
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // O cambia * por tu frontend
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ✅ SEGUNDA CAPA: middleware express
app.use(express.json());

app.use((req, res, next) => {
  console.log(`🛬 Nueva petición: ${req.method} ${req.url}`);
  next();
});

// ✅ RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/plantillas', plantillaRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ RUTA DE PRUEBA
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error de conexión' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en puerto ${PORT}`);
});
