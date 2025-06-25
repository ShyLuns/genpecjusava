import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import dotenv from 'dotenv';
import emailjs from '@emailjs/nodejs';

dotenv.config();
const router = express.Router();

// 🔹 Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo, contrasena } = req.body;

    // Validar si el usuario ya existe
    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar en la BD
    await pool.query(
      'INSERT INTO usuarios (nombre, apellido, telefono, correo, contrasena) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, telefono, correo, hashedPassword]
    );

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post("/login", async (req, res) => {
  const { correo, contraseña } = req.body;
  console.log("Datos recibidos:", { correo, contraseña });

  if (!correo || !contraseña) {
    return res.status(400).json({ error: "Correo y contraseña son requeridos." });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado." });
    }

    const usuario = rows[0];
    console.log("Usuario encontrado:", usuario);

    if (!usuario.contrasena) {
      return res.status(500).json({ error: "Error en la base de datos: contraseña no encontrada." });
    }

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contrasena);
    console.log("Comparación de contraseñas:", contraseñaValida);

    if (!contraseñaValida) {
      return res.status(401).json({ error: "Contraseña incorrecta." });
    }

    // ✅ Verificar si el usuario está inactivo por su estado (ENUM)
    if (usuario.estado !== 'activo') {
      return res.status(403).json({ error: "Usuario inactivo. Contacta al administrador." });
    }
    
    console.log("Intentando login para:", correo);

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      nombre: usuario.nombre,
      correo: usuario.correo,
      apellido: usuario.apellido,
      rol: usuario.rol
    });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
});


// 🔹 Ruta para recuperar contraseña
router.post("/recover", async (req, res) => {
  const { correo } = req.body;

  try {
    // ✅ Buscar el usuario en la BD
    const [rows] = await pool.query("SELECT id FROM usuarios WHERE correo = ?", [correo]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Correo no encontrado." });
    }

    const usuario = rows[0];

    // ✅ Crear un token de recuperación con vencimiento de 15 minutos
    const resetToken = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // ✅ Enviar el token al frontend
    res.json({ resetToken });

  } catch (error) {
    console.error("Error en recuperación:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
});

// 🔹 Ruta para resetear contraseña
router.post("/reset-password", async (req, res) => {
  const { token, nuevaContrasena } = req.body;

  try {
    // ✅ Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);

    // ✅ Actualizar en la BD
    await pool.query("UPDATE usuarios SET contrasena = ? WHERE id = ?", [hashedPassword, decoded.id]);

    res.json({ message: "Contraseña restablecida con éxito." });

  } catch (error) {
    console.error("Error en reset-password:", error);
    res.status(400).json({ error: "Token inválido o expirado." });
  }
});


export default router;
