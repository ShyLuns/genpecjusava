import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import Swal from "sweetalert2";
import ModalAgregar from "../components/ModalAgregar";
import ModalEditar from "../components/ModalEditar";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Tooltip, Button, CircularProgress, TextField, InputAdornment
} from "@mui/material";

import { Home } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";


const Empresas = () => {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ tipo: null, data: null });
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                window.location.href = "/login";
                return;
            }

            const response = await fetch(`${API_URL}/empresas`, {
                headers: { Authorization: `Bearer ${token}` }
            });


            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
                return;
            }

            if (!response.ok) throw new Error("Error al cargar empresas.");

            const data = await response.json();
            setEmpresas(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const eliminarEmpresa = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar empresa?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
        });

        if (!confirm.isConfirmed) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/empresas/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });


            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
                return;
            }

            if (!response.ok) throw new Error("No se pudo eliminar.");

            setEmpresas(empresas.filter((empresa) => empresa.id !== id));
            Swal.fire("Eliminado", "La empresa ha sido eliminada.", "success");
        } catch (error) {
            console.error("Error eliminando empresa:", error);
        }
    };

    // Función para dividir el texto en líneas cada 40 caracteres
    const formatActividadEconomica = (text) => {
        return text.replace(/(.{200})/g, "$1\n");
    };

    // Filtrar empresas según el término de búsqueda
    const empresasFiltradas = empresas.filter(empresa =>
        empresa.nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-5">
            {/* Encabezado y Barra de Búsqueda */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Empresas</h1>
                    <Button
                        variant="outlined"
                        startIcon={<Home size={22} />} // Icono de casa 🏠
                        onClick={() => window.location.href = "/dashboard"}
                        sx={{
                            borderColor: "#2563eb", // Borde azul moderno
                            color: "#2563eb",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            textTransform: "none",
                            padding: "8px 16px",
                            transition: "all 0.3s ease",
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
                <div className="flex gap-4">
                    <TextField
                        variant="outlined"
                        placeholder="Buscar empresa..."
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "12px", // Bordes más redondeados
                                backgroundColor: "rgba(255, 255, 255, 0.1)", // Fondo semi-transparente
                                backdropFilter: "blur(10px)", // Efecto Glassmorphism
                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Sombra moderna
                                transition: "all 0.3s ease",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.2)", // Cambia en hover
                                },
                                "&.Mui-focused": {
                                    backgroundColor: "white", // Color de fondo al enfocarse
                                    boxShadow: "0 0 30px rgba(37, 99, 235, 0.5)", // Brillo en el borde
                                    borderColor: "#2563eb", // Azul moderno
                                },
                            },
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" }, // Sin borde visible
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} className="text-blue-500" /> {/* Ícono en azul */}
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
                            backgroundColor: "#2563eb", // Azul moderno
                            color: "white",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            textTransform: "none",
                            padding: "10px 20px",
                            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                backgroundColor: "#1e40af", // Azul más oscuro en hover
                                boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
                            },
                        }}
                    >
                        Agregar Empresa
                    </Button>

                </div>
            </div>
            {/* Carga de datos */}
            {loading ? (
                <div className="flex justify-center mt-10">
                    <CircularProgress />
                </div>
            ) : (
                <div className="overflow-x-auto max-w-full">
                    <TableContainer component={Paper} className="shadow-lg rounded-lg" sx={{ overflowX: "auto" }}>
                        <Table sx={{ minWidth: 1500 }}>
                            <TableHead>
                                <TableRow style={{ backgroundColor: "#f3f4f6" }}>
                                    {[
                                        "Nombre", "CIIU", "Actividad Económica", "N° Empleados", "Dirección",
                                        "Correo", "Teléfono", "Diseño", "Responsable PSB", "Representante Legal",
                                        "Ciudad", "NIT", "Dígito Verificación", "Tipo", "Tipo de Empresa", "Conjugación", "Conjugación2",
                                        "Gentilicio", "2121/17", "Teléfono SST", "Correo SST", "NR", "Matrícula CC", "Acciones"
                                    ].map((header) => (
                                        <TableCell
                                            key={header}
                                            sx={header === "Actividad Económica" ? { minWidth: 300 } : {}}
                                        >
                                            <b>{header}</b>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {empresasFiltradas.length > 0 ? (
                                    empresasFiltradas.map((empresa) => (
                                        <TableRow key={empresa.id} hover>
                                            <TableCell>{empresa.nombre}</TableCell>
                                            <TableCell>{empresa.codigo_ciiu}</TableCell>
                                            <TableCell sx={{ whiteSpace: "pre-wrap", minWidth: 300 }}>
                                                {formatActividadEconomica(empresa.actividad_economica)}
                                            </TableCell>
                                            <TableCell>{empresa.numero_empleados}</TableCell>
                                            <TableCell>{empresa.direccion}</TableCell>
                                            <TableCell>{empresa.correo}</TableCell>
                                            <TableCell>{empresa.telefono}</TableCell>
                                            <TableCell>{empresa.diseno}</TableCell>
                                            <TableCell>{empresa.responsable_psb}</TableCell>
                                            <TableCell>{empresa.representante_legal}</TableCell>
                                            <TableCell>{empresa.ciudad}</TableCell>
                                            <TableCell>{empresa.nit}</TableCell>
                                            <TableCell>{empresa.digito_v}</TableCell>
                                            <TableCell>{empresa.tipo}</TableCell>
                                            <TableCell>{empresa.tipo_empresa}</TableCell>
                                            <TableCell>{empresa.conjugacion}</TableCell>
                                            <TableCell>{empresa.conjugacion_ii}</TableCell>
                                            <TableCell>{empresa.gentilicio}</TableCell>
                                            <TableCell>{empresa.dato_2121_7}</TableCell>
                                            <TableCell>{empresa.telefono_sst}</TableCell>
                                            <TableCell>{empresa.correo_sst}</TableCell>
                                            <TableCell>{empresa.nr}</TableCell>
                                            <TableCell>{empresa.matricula_cc}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        color="warning"
                                                        onClick={() => setModal({ tipo: "editar", data: empresa })}
                                                    >
                                                        <Pencil size={20} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => eliminarEmpresa(empresa.id)}
                                                    >
                                                        <Trash2 size={20} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={24} align="center">
                                            No hay empresas registradas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                    </TableContainer>
                </div>
            )}
            {/* Modales */}
            {modal.tipo === "agregar" && (
                <ModalAgregar onClose={() => setModal({ tipo: null })} onEmpresaAgregada={fetchEmpresas} />
            )}
            {modal.tipo === "editar" && modal.data && (
                <ModalEditar empresa={modal.data} onClose={() => setModal({ tipo: null })} />
            )}
        </div>
    );
};

export default Empresas;