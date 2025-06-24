import React, { useState, useEffect } from "react";
import { Pencil, Plus, Search, Home } from "lucide-react";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import ModalAgregarUsuario from "../components/ModalAgregarUsuario";
import ModalEditarUsuario from "../components/ModalEditarUsuario";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Tooltip, Button, CircularProgress, TextField, InputAdornment, FormControlLabel, Checkbox
} from "@mui/material";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";


const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ tipo: null, data: null });
    const [search, setSearch] = useState("");
    const [mostrarSoloActivos, setMostrarSoloActivos] = useState(false);
    const [usuarioActualId, setUsuarioActualId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUsuarioActualId(decoded.id); // Asegúrate que el token tenga `id`
        } catch (e) {
            console.error("Error al decodificar el token", e);
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return window.location.href = "/login";

            const response = await fetch(`${API_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` }
            });


            if (response.status === 401) {
                localStorage.removeItem("token");
                return window.location.href = "/login";
            }

            if (!response.ok) throw new Error("Error al cargar usuarios.");

            const data = await response.json();
            setUsuarios(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstadoUsuario = async (usuario) => {

        if (usuario.id === usuarioActualId) {
            Swal.fire({
                icon: "error",
                title: "Acción no permitida",
                text: "No puedes desactivar tu propio usuario.",
            });
            return;
        }
        const nuevoEstado = usuario.estado === "activo" ? "inactivo" : "activo";

        const confirm = await Swal.fire({
            title: `¿${nuevoEstado === "activo" ? "Activar" : "Desactivar"} usuario?`,
            text: `El usuario será marcado como ${nuevoEstado}.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí",
            cancelButtonText: "Cancelar",
        });

        if (!confirm.isConfirmed) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/usuarios/${usuario.id}/estado`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });


            if (!response.ok) throw new Error("Error al cambiar el estado");

            const updated = usuarios.map((u) =>
                u.id === usuario.id ? { ...u, estado: nuevoEstado } : u
            );
            setUsuarios(updated);

            Swal.fire("Estado actualizado", `Usuario ${nuevoEstado}.`, "success");
        } catch (error) {
            console.error("Error cambiando estado:", error);
        }
    };

    const usuariosFiltrados = usuarios.filter((u) =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) &&
        (!mostrarSoloActivos || u.estado === "activo")
    );

    return (
        <div className="p-5">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Usuarios</h1>
                    <Button
                        variant="outlined"
                        startIcon={<Home size={22} />}
                        onClick={() => window.location.href = "/dashboard"}
                        sx={{
                            borderColor: "#2563eb",
                            color: "#2563eb",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            textTransform: "none",
                            padding: "8px 16px",
                            "&:hover": {
                                backgroundColor: "#2563eb",
                                color: "white",
                                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
                            },
                        }}
                    >
                        Volver al Dashboard
                    </Button>
                </div>
                <div className="flex gap-4 items-center">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={mostrarSoloActivos}
                                onChange={(e) => setMostrarSoloActivos(e.target.checked)}
                                sx={{ color: "#2563eb", '&.Mui-checked': { color: "#2563eb" } }}
                            />
                        }
                        label="Mostrar solo activos"
                    />
                    <TextField
                        variant="outlined"
                        placeholder="Buscar usuario..."
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                backdropFilter: "blur(10px)",
                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                                "&.Mui-focused": {
                                    backgroundColor: "white",
                                    boxShadow: "0 0 30px rgba(37, 99, 235, 0.5)",
                                },
                            },
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} className="text-blue-500" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Plus size={22} />}
                        onClick={() => setModal({ tipo: "agregar" })}
                        sx={{
                            backgroundColor: "#2563eb",
                            color: "white",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            textTransform: "none",
                            padding: "10px 20px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            "&:hover": {
                                backgroundColor: "#1e40af",
                                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
                            },
                        }}
                    >
                        Agregar Usuario
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center mt-10">
                    <CircularProgress />
                </div>
            ) : (
                <TableContainer component={Paper} className="shadow-lg rounded-lg">
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: "#f3f4f6" }}>
                                {["Nombre", "Apellido", "Teléfono", "Correo", "Rol", "Activo", "Acciones"].map((header) => (
                                    <TableCell key={header}><b>{header}</b></TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuariosFiltrados.length > 0 ? (
                                usuariosFiltrados.map((usuario) => (
                                    <TableRow key={usuario.id} hover>
                                        <TableCell>{usuario.nombre}</TableCell>
                                        <TableCell>{usuario.apellido}</TableCell>
                                        <TableCell>{usuario.telefono}</TableCell>
                                        <TableCell>{usuario.correo}</TableCell>
                                        <TableCell>{usuario.rol}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color={usuario.estado === "activo" ? "success" : "error"}
                                                onClick={() => cambiarEstadoUsuario(usuario)}
                                            >
                                                {usuario.estado === "activo" ? "Sí" : "No"}
                                            </Button>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    color="warning"
                                                    onClick={() => setModal({ tipo: "editar", data: usuario })}
                                                >
                                                    <Pencil size={20} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay usuarios registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {modal.tipo === "agregar" && (
                <ModalAgregarUsuario onClose={() => setModal({ tipo: null })} onUsuarioAgregado={fetchUsuarios} />
            )}
            {modal.tipo === "editar" && modal.data && (
                <ModalEditarUsuario usuario={modal.data} onClose={() => setModal({ tipo: null })} />
            )}
        </div>
    );
};

export default Usuarios;
