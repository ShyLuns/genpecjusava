import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import pool from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import XlsxPopulate from "xlsx-populate";
import axios from "axios";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/generar/:empresaId/:plantillaId", authMiddleware, async (req, res) => {
  const { empresaId, plantillaId } = req.params;

  try {
    // Obtener datos de empresa
    const [empresaRows] = await pool.query("SELECT * FROM empresas WHERE id = ?", [empresaId]);
    if (empresaRows.length === 0) return res.status(404).json({ error: "Empresa no encontrada" });
    const empresa = empresaRows[0];

    // Obtener plantilla
    const [plantillaRows] = await pool.query("SELECT ruta, nombre, tipo FROM plantillas WHERE id = ?", [plantillaId]);
    if (plantillaRows.length === 0) return res.status(404).json({ error: "Plantilla no encontrada" });

    const plantilla = plantillaRows[0];
    const url = plantilla.ruta; // URL pública de Cloudinary
    const extension = plantilla.tipo.toLowerCase(); // 'docx' o 'xlsx'
    const nombreBase = `${empresa.nombre} - ${plantilla.nombre}`;
    let buffer;

    if (extension === "docx") {
      // Descargar archivo desde Cloudinary
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const contenido = response.data;
      const zip = new PizZip(contenido);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: "[[", end: "]]" },
      });

      doc.render(empresa);
      buffer = doc.getZip().generate({ type: "nodebuffer" });

    } else if (extension === "xlsx") {
      // Descargar archivo Excel desde Cloudinary
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const workbook = await XlsxPopulate.fromDataAsync(response.data);

      workbook.sheets().forEach((sheet) => {
        sheet.usedRange().forEach((cell) => {
          const value = cell.value();
          if (typeof value === "string") {
            const matches = value.match(/\[\[(.*?)\]\]/g);
            if (matches) {
              let nuevoValor = value;
              matches.forEach((match) => {
                const key = match.replace("[[", "").replace("]]", "");
                nuevoValor = nuevoValor.replaceAll(match, empresa[key] ?? "");
              });
              cell.value(nuevoValor);
            }
          }
        });
      });

      buffer = await workbook.outputAsync();

    } else {
      return res.status(400).json({ error: "Formato de plantilla no compatible" });
    }

    // Guardar en la base de datos
    await pool.query(
      `INSERT INTO documentos_generados (nombre_documento, plantilla_id, empresa_id, generado_por, fecha_generacion)
       VALUES (?, ?, ?, ?, NOW())`,
      [`${nombreBase}.${extension}`, plantillaId, empresaId, req.user.id]
    );

    res.set({
      "Content-Type":
        extension === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(nombreBase + '.' + extension)}"`,
    });

    return res.send(buffer);

  } catch (error) {
    console.error("🚨 Error al generar documento:", error);
    return res.status(500).json({ error: "Error interno al generar documento" });
  }
});

// 🔐 Historial de documentos
router.get("/historial", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT dg.id,
              dg.nombre_documento AS nombre,
              dg.fecha_generacion,
              e.nombre AS empresa,
              u.nombre AS usuario
       FROM documentos_generados dg
       LEFT JOIN empresas e ON dg.empresa_id = e.id
       LEFT JOIN usuarios u ON dg.generado_por = u.id
       ORDER BY dg.fecha_generacion DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error("🚨 Error obteniendo historial:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

// 🔐 Historial filtrado por usuario
router.get("/historial?propios=true", authMiddleware, async (req, res) => {
  const verSoloMios = req.query.propios === "true";
  const sql = `
    SELECT dg.id, dg.nombre_documento AS nombre, dg.fecha_generacion,
           e.nombre AS empresa, u.nombre AS usuario
    FROM documentos_generados dg
    LEFT JOIN empresas e ON dg.empresa_id = e.id
    LEFT JOIN usuarios u ON dg.generado_por = u.id
    ${verSoloMios ? "WHERE dg.generado_por = ?" : ""}
    ORDER BY dg.fecha_generacion DESC
  `;

  const params = verSoloMios ? [req.user.id] : [];

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("🚨 Error:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

export default router;
