import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';

import authRoutes from './routes/authRoutes.js';
import empresaRoutes from './routes/empresaRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import plantillaRoutes from './routes/plantillaRoutes.js';

import documentosRoutes from "./routes/documentos.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: 'https://gpec-frontend.onrender.com', // 👈 tu frontend real
  credentials: true
}));

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/plantillas', plantillaRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/documentos", documentosRoutes);

app.get('/test-db', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT 1 + 1 AS result');
      res.json({ success: true, result: rows[0] });
    } catch (error) {
      console.error('Error de conexión:', error);
      res.status(500).json({ success: false, message: 'Error de conexión' });
    }
  });
  

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});