import React, { useState } from "react";
import {
  Modal, Fade, Backdrop, Grid, TextField, Button, CircularProgress,
  MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import { X, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

const ModalAgregarUsuario = ({ onClose, onUsuarioAgregado }) => {
  const [usuario, setUsuario] = useState({
    nombre: "", apellido: "", telefono: "", correo: "", contraseña: "", rol: ""
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState("");

  const toggleMostrarContraseña = () => {
    setMostrarContraseña(!mostrarContraseña);
  };

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const validarCampos = () => {
    const nuevosErrores = {};

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(usuario.nombre.trim())) {
      nuevosErrores.nombre = "El nombre solo debe contener letras.";
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(usuario.apellido.trim())) {
      nuevosErrores.apellido = "El apellido solo debe contener letras.";
    }

    if (!/^[\d\w\s\-\+]{0,14}$/.test(usuario.telefono)) {
      nuevosErrores.telefono = "Máximo 14 caracteres, solo letras, números y símbolos comunes.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.correo.trim())) {
      nuevosErrores.correo = "Correo electrónico no válido.";
    }

    if (!/(?=.*[A-Z]).{8,}/.test(usuario.contraseña)) {
      nuevosErrores.contraseña = "Mínimo 8 caracteres y al menos una mayúscula.";
    }

    if (!usuario.rol) {
      nuevosErrores.rol = "Seleccione un rol.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGeneral("");

    if (!validarCampos()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(usuario)
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = { mensaje: "Respuesta inválida del servidor." };
      }

      console.log("Respuesta del servidor:", data);

      if (!response.ok) {
        if (response.status === 409) {
          await new Promise(resolve => setTimeout(resolve, 0));
          setErrores(prev => ({
            ...prev,
            correo: data.message || "El correo ya está registrado."
          }));
        } else {
          setErrorGeneral(data.mensaje || "Error al agregar usuario.");
        }

        setLoading(false);
        return;
      }

      onUsuarioAgregado();
      Swal.fire("¡Éxito!", "Usuario agregado correctamente.", "success");
      onClose();
    } catch (error) {
      setErrorGeneral("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };


    return (
        <Modal open={true} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
            <Fade in={true}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl transition-all">
                    <h2 className="text-2xl font-bold text-gray-700 pb-4">Agregar Usuario</h2>
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
                                        value={usuario[name] || ""}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                        error={Boolean(errores[name])}
                                        helperText={errores[name]}
                                    />
                                </Grid>
                            ))}

                            {/* Campo de Contraseña */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Contraseña"
                                    name="contraseña"
                                    type={mostrarContraseña ? "text" : "password"}
                                    value={usuario.contraseña}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    error={Boolean(errores.contraseña)}
                                    helperText={errores.contraseña}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={toggleMostrarContraseña} edge="end">
                                                    {mostrarContraseña ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            {/* Campo Select de Rol */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" error={Boolean(errores.rol)}>
                                    <InputLabel id="rol-label">Rol</InputLabel>
                                    <Select
                                        labelId="rol-label"
                                        name="rol"
                                        value={usuario.rol}
                                        onChange={handleChange}
                                        label="Rol"
                                    >
                                        <MenuItem value="administrador">Administrador</MenuItem>
                                        <MenuItem value="digitador">Digitador</MenuItem>
                                        <MenuItem value="usuario_final">Usuario Final</MenuItem>
                                    </Select>
                                    {errores.rol && (
                                        <p className="text-sm text-red-600 mt-1 ml-2">{errores.rol}</p>
                                    )}
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Botones */}
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
                                startIcon={<Plus size={18} />}
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
                                {loading ? <CircularProgress size={24} /> : "Agregar Usuario"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Fade>
        </Modal>
    );
};

export default ModalAgregarUsuario;
