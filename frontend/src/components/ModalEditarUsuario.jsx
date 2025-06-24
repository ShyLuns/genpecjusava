import React, { useState, useEffect } from "react";
import {
    Modal, Fade, Backdrop, Grid, TextField, MenuItem,
    Button, CircularProgress
} from "@mui/material";
import { X, Save } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

const ModalEditarUsuario = ({ usuario, onClose, onUsuarioEditado }) => {
    const [usuarioEditado, setUsuarioEditado] = useState(usuario);
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUsuarioEditado(usuario);
        setErrores({});
    }, [usuario]);

    const validar = () => {
        const nuevosErrores = {};

        if (!usuarioEditado.nombre?.trim() || usuarioEditado.nombre.length < 2) {
            nuevosErrores.nombre = "Debe tener al menos 2 caracteres.";
        }

        if (!usuarioEditado.apellido?.trim() || usuarioEditado.apellido.length < 2) {
            nuevosErrores.apellido = "Debe tener al menos 2 caracteres.";
        }

        if (!usuarioEditado.telefono?.trim() || usuarioEditado.telefono.length < 7) {
            nuevosErrores.telefono = "Debe tener al menos 7 dígitos.";
        }

        if (!usuarioEditado.correo?.trim()) {
            nuevosErrores.correo = "El correo es obligatorio.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuarioEditado.correo)) {
            nuevosErrores.correo = "Correo no válido.";
        }

        if (!usuarioEditado.rol) {
            nuevosErrores.rol = "Seleccione un rol.";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleChange = (e) => {
        setUsuarioEditado({ ...usuarioEditado, [e.target.name]: e.target.value });
        setErrores({ ...errores, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validar()) return;

        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(usuarioEditado)
            });

            if (response.status === 409) {
                const data = await response.json();
                setErrores(prev => ({ ...prev, correo: data.message || "Correo ya en uso." }));
                return;
            }

            if (!response.ok) throw new Error("Error al actualizar usuario.");

            onUsuarioEditado?.();
            Swal.fire("¡Éxito!", "Usuario actualizado correctamente.", "success").then(() => {
                location.reload();
            });

            onClose();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={true} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
            <Fade in={true}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl transition-all">
                    <h2 className="text-2xl font-bold text-gray-700 pb-4">Editar Usuario</h2>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {[
                                ["nombre", "Nombre"],
                                ["apellido", "Apellido"],
                                ["telefono", "Teléfono"],
                                ["correo", "Correo", "email"]
                            ].map(([name, label, type = "text"]) => (
                                <Grid item xs={12} sm={6} key={name}>
                                    <TextField
                                        fullWidth
                                        label={label}
                                        name={name}
                                        type={type}
                                        value={usuarioEditado[name] || ""}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                        error={Boolean(errores[name])}
                                        helperText={errores[name]}
                                    />
                                </Grid>
                            ))}

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Rol"
                                    name="rol"
                                    value={usuarioEditado.rol || ""}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    error={Boolean(errores.rol)}
                                    helperText={errores.rol}
                                >
                                    <MenuItem value="administrador">Administrador</MenuItem>
                                    <MenuItem value="digitador">Digitador</MenuItem>
                                    <MenuItem value="usuario_final">Usuario Final</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>

                        <div className="flex justify-end mt-6 gap-3">
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                color="error"
                                startIcon={<X size={18} />}
                                sx={{
                                    borderRadius: "8px",
                                    borderColor: "#d32f2f",
                                    color: "#d32f2f",
                                    "&:hover": {
                                        backgroundColor: "#ffebee",
                                        borderColor: "#b71c1c",
                                        color: "#b71c1c"
                                    }
                                }}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<Save size={18} />}
                                sx={{
                                    borderRadius: "8px",
                                    background: "linear-gradient(135deg, #1976D2, #1565C0)",
                                    color: "white",
                                    padding: "8px 20px",
                                    fontWeight: "bold",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #1565C0, #0D47A1)"
                                    }
                                }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : "Guardar"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Fade>
        </Modal>
    );
};

export default ModalEditarUsuario;