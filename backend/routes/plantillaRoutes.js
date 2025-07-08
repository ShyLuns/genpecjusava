import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

// 📂 Asegurarse que /uploads/ sea accesible públicamente
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 📁 Configuración de multer para guardar archivos en el servidor
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads')); // ruta relativa
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 🧾 Obtener plantillas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [plantillas] = await pool.query(`
      SELECT p.id, p.nombre, p.tipo, p.ruta, p.tipo_empresa, u.nombre AS creado_por
      FROM plantillas p
      JOIN usuarios u ON p.creado_por = u.id
    `);
    res.json(plantillas);
  } catch (error) {
    console.error("❌ Error en GET /plantillas:", error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// 📤 Subir plantilla
router.post('/', authMiddleware, upload.single('archivo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo' });

  const { originalname, filename } = req.file;
  const { tipo_empresa } = req.body;
  const tipo = path.extname(originalname).toLowerCase() === '.docx' ? 'docx' : 'xlsx';
  const ruta = `uploads/${filename}`;
  const usuarioId = req.user.id;

  try {
    await pool.query(
      'INSERT INTO plantillas (nombre, tipo, ruta, tipo_empresa, creado_por) VALUES (?, ?, ?, ?, ?)',
      [originalname, tipo, ruta, tipo_empresa.toLowerCase(), usuarioId]
    );

    res.json({ message: 'Plantilla subida con éxito', ruta });
  } catch (error) {
    console.error("❌ Error al guardar plantilla:", error);
    res.status(500).json({ message: 'Error al guardar la plantilla' });
  }
});

// 🗑 Eliminar plantilla
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [plantilla] = await pool.query('SELECT ruta FROM plantillas WHERE id = ?', [id]);
    if (plantilla.length === 0) return res.status(404).json({ message: 'Plantilla no encontrada' });

    const filePath = path.join(__dirname, '..', plantilla[0].ruta);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM plantillas WHERE id = ?', [id]);

    res.json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    console.error("❌ Error al eliminar plantilla:", error);
    res.status(500).json({ message: 'Error al eliminar la plantilla' });
  }
});

// 📁 routes/plantillaRoutes.js
router.get('/faltantes', authMiddleware, async (req, res) => {
  try {
    const [plantillas] = await pool.query('SELECT id, nombre, ruta FROM plantillas');

    const faltantes = plantillas.filter((p) => {
      const rutaAbsoluta = path.join(__dirname, "..", p.ruta);
      return !fs.existsSync(rutaAbsoluta);
    });

    res.json(faltantes);
  } catch (error) {
    console.error("❌ Error detectando plantillas faltantes:", error);
    res.status(500).json({ message: 'Error al verificar plantillas faltantes' });
  }
});

export default router;
