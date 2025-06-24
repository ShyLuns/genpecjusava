import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Obtener empresas (Protegido con JWT)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM empresas');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Crear una empresa (Protegido con JWT)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            nombre, codigo_ciiu, actividad_economica, numero_empleados, direccion, correo, telefono,
            nit, representante_legal, ciudad, digito_v, diseno, responsable_psb, conjugacion,
            conjugacion_ii, gentilicio, dato_2121_7, telefono_sst, correo_sst, nr, matricula_cc, tipo, tipo_empresa
        } = req.body;

        // Verificar campos obligatorios
        const requiredFields = [
            nombre, codigo_ciiu, actividad_economica, numero_empleados, direccion,
            correo, telefono, nit, representante_legal, ciudad, digito_v, diseno,
            responsable_psb, conjugacion, conjugacion_ii, gentilicio, dato_2121_7,
            telefono_sst, correo_sst, nr, matricula_cc, tipo, tipo_empresa
        ];
        if (requiredFields.some(field => field === undefined || field === null || field === "")) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // Validar que codigo_ciiu y numero_empleados sean solo números
        if (!/^\d+$/.test(codigo_ciiu)) {
            return res.status(400).json({ message: 'El código CIIU debe contener solo números' });
        }
        if (!/^\d+$/.test(numero_empleados)) {
            return res.status(400).json({ message: 'El número de empleados debe contener solo números' });
        }

        // Validar que el NIT no esté registrado
        const [existing] = await pool.query('SELECT id FROM empresas WHERE nit = ?', [nit]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'El NIT ya está registrado' });
        }

        // Insertar empresa
        const [result] = await pool.query(
            `INSERT INTO empresas 
            (nombre, codigo_ciiu, actividad_economica, numero_empleados, direccion, correo, telefono, nit, 
            representante_legal, ciudad, digito_v, diseno, responsable_psb, conjugacion, conjugacion_ii, 
            gentilicio, dato_2121_7, telefono_sst, correo_sst, nr, matricula_cc, tipo, tipo_empresa) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre, codigo_ciiu, actividad_economica, numero_empleados, direccion, correo, telefono, nit,
                representante_legal, ciudad, digito_v, diseno, responsable_psb, conjugacion, conjugacion_ii,
                gentilicio, dato_2121_7, telefono_sst, correo_sst, nr, matricula_cc, tipo, tipo_empresa
            ]
        );

        res.status(201).json({ message: 'Empresa creada exitosamente', id: result.insertId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Obtener una empresa por ID (Protegido con JWT)
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM empresas WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;

    try {
        // Verificar si ya existe otra empresa con el mismo NIT (excepto la actual)
        const [empresasConMismoNIT] = await pool.query(
            'SELECT id FROM empresas WHERE nit = ? AND id != ?',
            [datosActualizados.nit, id]
        );

        if (empresasConMismoNIT.length > 0) {
            return res.status(400).json({ message: 'Ya existe una empresa con ese NIT' });
        }

        // Actualizar si no hay duplicado
        const [result] = await pool.query('UPDATE empresas SET ? WHERE id = ?', [datosActualizados, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }

        res.json({ message: 'Empresa actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});



// Eliminar una empresa por ID (Protegido con JWT)
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM empresas WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }

        res.json({ message: 'Empresa eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});



export default router;
