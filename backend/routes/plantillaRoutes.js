import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { storage } from '../utils/cloudinary.js';
import { cloudinary } from "../utils/cloudinary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Hacer que la carpeta "uploads" sea accesible
router.use('/uploads', express.static('uploads'));

const upload = multer({ storage });

// Obtener todas las plantillas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [plantillas] = await pool.query(`
      SELECT p.id, p.nombre, p.tipo, p.ruta, p.tipo_empresa, u.nombre AS creado_por
      FROM plantillas p
      JOIN usuarios u ON p.creado_por = u.id
    `);

    res.json(plantillas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Subir una nueva plantilla
router.post('/', authMiddleware, upload.single('archivo'), async (req, res) => {
  console.log("📦 Archivo recibido:", req.file);
  console.log("🏢 Tipo de empresa:", req.body.tipo_empresa);
  console.log("👤 Usuario:", req.user);

  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }

  const { originalname } = req.file;
  const ruta = req.file.path;
  const { tipo_empresa } = req.body;
  const tipo = path.extname(originalname).toLowerCase() === '.docx' ? 'docx' : 'xlsx';
  const usuarioId = req.user.id;

  try {
    await pool.query(
      'INSERT INTO plantillas (nombre, tipo, ruta, tipo_empresa, creado_por) VALUES (?, ?, ?, ?, ?)',
      [originalname, tipo, ruta, tipo_empresa, usuarioId]
    );

    res.json({ message: 'Plantilla subida con éxito', ruta });
  } catch (error) {
    console.error("❌ Error en la base de datos:", error);
    res.status(500).json({ message: 'Error al guardar la plantilla' });
  }
});


// Eliminar una plantilla
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [plantilla] = await pool.query('SELECT ruta FROM plantillas WHERE id = ?', [id]);

    if (plantilla.length === 0) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }

    const url = plantilla[0].ruta;

    // ✅ Extraer public_id desde URL de Cloudinary
    const publicId = url
      .split('/')
      .slice(-1)[0]
      .split('.')[0]; // ej. '1689706542-miarchivo.docx' => '1689706542-miarchivo'

    // ✅ Eliminar archivo de Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // ✅ Eliminar registro en la base de datos
    const [result] = await pool.query('DELETE FROM plantillas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }

    res.json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    console.error("🚨 Error al eliminar plantilla:", error);
    res.status(500).json({ message: 'Error al eliminar la plantilla' });
  }
});

router.get("/test", (req, res) => {
  console.log("🧪 Ruta de prueba alcanzada.");
  res.send("Ruta test OK");
});


export default router;
