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

// Hacer que la carpeta "uploads" sea accesible
router.use('/uploads', express.static('uploads'));

// Configuración de multer para almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

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
  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ningún archivo' });
  }

  const { originalname, filename } = req.file;
  const { tipo_empresa } = req.body; // ✅ Extraer el tipo de empresa correctamente
  if (!tipo_empresa) {
    return res.status(400).json({ message: "El tipo de empresa es obligatorio" });
  }

  const tipo = path.extname(originalname).toLowerCase() === '.docx' ? 'docx' : 'xlsx';
  const ruta = `uploads/${filename}`;
  const usuarioId = req.user.id;

  try {
    await pool.query(
      'INSERT INTO plantillas (nombre, tipo, ruta, tipo_empresa, creado_por) VALUES (?, ?, ?, ?, ?)',
      [originalname, tipo, ruta, tipo_empresa, usuarioId]
    );

    res.json({ message: 'Plantilla subida con éxito', ruta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar la plantilla' });
  }
});

// Eliminar una plantilla
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar la ruta del archivo antes de eliminarlo de la base de datos
    const [plantilla] = await pool.query('SELECT ruta FROM plantillas WHERE id = ?', [id]);

    if (plantilla.length === 0) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }

    // 🔹 Obtener la ruta absoluta del archivo
    const rutaArchivo = path.join(__dirname, "..", plantilla[0].ruta);

    // 🔹 Eliminar archivo físicamente con manejo de errores
    try {
      if (fs.existsSync(rutaArchivo)) {
        fs.unlinkSync(rutaArchivo);
        console.log(`🗑 Archivo eliminado: ${rutaArchivo}`);
      } else {
        console.warn(`⚠️ Archivo no encontrado: ${rutaArchivo}`);
      }
    } catch (err) {
      console.error('🚨 Error al eliminar archivo:', err);
      return res.status(500).json({ message: 'Error al eliminar el archivo' });
    }

    // 🔹 Eliminar la plantilla de la base de datos
    const [result] = await pool.query('DELETE FROM plantillas WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Plantilla no encontrada' });
    }

    res.json({ message: 'Plantilla eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la plantilla' });
  }
});

export default router;
