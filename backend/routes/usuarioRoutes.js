import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Obtener todos los usuarios (Protegido con JWT)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [usuarios] = await pool.query('SELECT id, nombre, apellido, telefono, correo, rol, estado FROM usuarios');
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener un usuario por ID (Protegido con JWT)
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const [usuarios] = await pool.query('SELECT id, nombre, apellido, telefono, correo, rol, estado FROM usuarios WHERE id = ?', [id]);

        if (usuarios.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(usuarios[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Actualizar un usuario (Protegido con JWT)
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { correo } = req.body;

    try {
        // Verificar si el correo ya está en uso por otro usuario
        const [usuariosExistentes] = await pool.query(
            'SELECT id FROM usuarios WHERE correo = ? AND id != ?',
            [correo, id]
        );

        if (usuariosExistentes.length > 0) {
            return res.status(409).json({ message: 'El correo ya está registrado por otro usuario' });
        }

        // Continuar con la actualización
        const [result] = await pool.query('UPDATE usuarios SET ? WHERE id = ?', [req.body, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


// Eliminar un usuario (Protegido con JWT)
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Agregar un usuario (Protegido con JWT)
router.post('/', authMiddleware, async (req, res) => {
    const { nombre, apellido, telefono, correo, contraseña, rol, estado } = req.body;
    const estadoFinal = estado || 'activo';


    // Validar campos requeridos
    if (!nombre || !apellido || !telefono || !correo || !contraseña) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const rolFinal = rol || 'usuario_final';

    try {
        // Validar si el correo ya existe
        const [usuariosExistentes] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
        if (usuariosExistentes.length > 0) {
            return res.status(409).json({ message: 'El correo ya está registrado' }); // Código 409: conflicto
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        // Insertar nuevo usuario
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, apellido, telefono, correo, contrasena, rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, telefono, correo, hashedPassword, rolFinal, estadoFinal]
        );


        res.status(201).json({ message: 'Usuario agregado correctamente', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


router.put("/actualizar/:id", async (req, res) => {
    const { nombre, apellido, correo } = req.body;

    // Obtención del token del encabezado de la solicitud
    const token = req.header('Authorization')?.split(' ')[1]; // Se asume que el token está en formato "Bearer <token>"

    if (!token) {
        return res.status(403).json({ message: "No se proporcionó el token" });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usando JWT_SECRET desde .env
        const userId = decoded.id; // ID del usuario desde el token

        // Actualización de los datos en la base de datos
        await pool.query("UPDATE usuarios SET nombre = ?, apellido = ?, correo = ? WHERE id = ?", [
            nombre,
            apellido,
            correo, // Cambiado 'email' por 'correo' para coincidir con el nombre de la columna en la base de datos
            userId
        ]);

        res.json({ message: "Usuario actualizado" });
    } catch (error) {
        console.error('Error de autenticación:', error);
        return res.status(401).json({ message: "Token no válido o expirado" });
    }
});

// Actualizar solo el estado de un usuario (Protegido con JWT)
router.patch('/:id/estado', authMiddleware, async (req, res) => {
    const { id } = req.params;
    let { estado } = req.body;

    if (estado === undefined) {
        return res.status(400).json({ message: 'El estado es requerido' });
    }

    // ✅ convierte booleano a string para ENUM
    if (typeof estado === 'boolean') {
        estado = estado ? 'activo' : 'inactivo';
    }

    try {
        const [result] = await pool.query(
            'UPDATE usuarios SET estado = ? WHERE id = ?',
            [estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: `Estado del usuario actualizado a '${estado}'` });
    } catch (error) {
        console.error('Error al actualizar estado del usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});







export default router;
