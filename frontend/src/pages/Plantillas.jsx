import React, { useState, useEffect } from "react";
import { UploadCloud, FileText, Trash2, FolderOpen, Search, Home } from "lucide-react";
import Swal from "sweetalert2";
import {
    Button, MenuItem, TextField, Select, CircularProgress, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Tooltip, InputAdornment, Box, Alert
} from "@mui/material";

import { FaFileExcel, FaFileWord } from "react-icons/fa";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";


function Plantillas() {
    const [plantillas, setPlantillas] = useState([]);
    const [archivo, setArchivo] = useState(null);
    const [tipoEmpresa, setTipoEmpresa] = useState("Bar");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const tiposEmpresa = ["Bar", "Piscina", "Parque", "Iglesia", "Colegio"];

    useEffect(() => {
        fetchPlantillas();
    }, []);

    const fetchPlantillas = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No hay token disponible");

            const response = await fetch(`${API_URL}/plantillas`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });


            if (!response.ok) throw new Error("No autorizado");

            const data = await response.json();
            setPlantillas(data);
        } catch (error) {
            console.error("Error al obtener plantillas:", error);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!archivo) {
            Swal.fire("Error", "Selecciona un archivo .docx o .xlsx", "error");
            return;
        }

        const restaurarPlantillas = async () => {
            const token = localStorage.getItem("token");

            const confirm = await Swal.fire({
                title: "¿Restaurar plantillas predeterminadas?",
                text: "Esto volverá a subir las plantillas por defecto.",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#2563eb",
                confirmButtonText: "Sí, restaurar",
            });

            if (!confirm.isConfirmed) return;

            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/plantillas/restaurar`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();
                Swal.fire("¡Listo!", data.message, "success");
                fetchPlantillas();
            } catch (error) {
                Swal.fire("Error", "No se pudieron restaurar las plantillas", "error");
            } finally {
                setLoading(false);
            }
        };


        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Error", "No tienes permiso para subir archivos", "error");
            return;
        }

        const formData = new FormData();
        formData.append("archivo", archivo);
        formData.append("tipo_empresa", tipoEmpresa);

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/plantillas`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });


            if (!response.ok) throw new Error("Error al subir la plantilla");

            Swal.fire("¡Éxito!", "Plantilla subida correctamente", "success").then(() => {
                setArchivo(null);
                fetchPlantillas();
            });

        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción eliminará la plantilla permanentemente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
        });

        if (confirm.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    Swal.fire("Error", "No tienes permiso para eliminar", "error");
                    return;
                }

                const response = await fetch(`${API_URL}/plantillas/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });


                if (!response.ok) throw new Error("Error al eliminar la plantilla");

                Swal.fire("¡Eliminado!", "La plantilla ha sido eliminada.", "success");
                fetchPlantillas();
            } catch (error) {
                Swal.fire("Error", error.message, "error");
            }
        }
    };

    const plantillasPorTipo = plantillas.reduce((acc, plantilla) => {
        if (!plantilla.tipo_empresa) return acc;
        (acc[plantilla.tipo_empresa] = acc[plantilla.tipo_empresa] || []).push(plantilla);
        return acc;
    }, {});

    return (
        <div className="p-6">
            {/* Aviso informativo sobre el formato del archivo */}
            <Alert severity="info" sx={{ marginBottom: 4 }}>
                Recuerda que los archivos que subas deben seguir el siguiente formato: <strong>[tipo de empresa] [nombre de la empresa], [nombre del documento]</strong>, como por ejemplo: "Bar Hotel XYZ, PEC" o "Piscina Aqua, Radicado".
            </Alert>

            {/* Encabezado */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Gestión de Plantillas</h2>
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

                <TextField
                    variant="outlined"
                    placeholder="Buscar plantilla..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} className="text-blue-500" />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>

            {/* Subida de archivos */}
            <div className="mb-8 flex flex-col md:flex-row items-center gap-4">
                <label className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg cursor-pointer border border-gray-300 hover:bg-gray-200 transition">
                    <FolderOpen size={24} className="text-blue-500" />
                    <span className="text-gray-700">
                        {archivo ? archivo.name : "Selecciona un archivo .docx o .xlsx"}
                    </span>
                    <input type="file" accept=".docx,.xlsx" onChange={(e) => setArchivo(e.target.files[0])} className="hidden" />
                </label>

                <Select
                    value={tipoEmpresa}
                    onChange={(e) => setTipoEmpresa(e.target.value)}
                    displayEmpty
                    variant="outlined"
                    size="small"
                    sx={{ width: "200px", borderRadius: "8px" }}
                >
                    <MenuItem value="">Selecciona un tipo de empresa</MenuItem>
                    {tiposEmpresa.map((tipo) => (
                        <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                    ))}
                </Select>

                <Button
                    onClick={handleUpload}
                    variant="contained"
                    startIcon={<UploadCloud size={20} />}
                    sx={{
                        background: "linear-gradient(135deg, #1976D2, #1565C0)",
                        color: "white",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontWeight: "bold",
                        "&:hover": { background: "linear-gradient(135deg, #1565C0, #0D47A1)" },
                    }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : "Subir Plantilla"}
                </Button>
                <Button
                    onClick={restaurarPlantillas}
                    variant="outlined"
                    startIcon={<UploadCloud />}
                    sx={{
                        color: "#16a34a",
                        borderColor: "#16a34a",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#16a34a", color: "white" },
                    }}
                    disabled={loading}
                >
                    Restaurar por defecto
                </Button>

            </div>

            {/* Listado de plantillas con filtro */}
            {Object.keys(plantillasPorTipo).map((tipo) => {
                const plantillasFiltradas = plantillasPorTipo[tipo].filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

                return plantillasFiltradas.length > 0 && (
                    <div key={tipo} className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-blue-700">{tipo}</h3>
                        <TableContainer component={Paper} className="shadow-md rounded-lg">
                            <Table>
                                <TableHead>
                                    <TableRow style={{ backgroundColor: "#f3f4f6" }}>
                                        <TableCell align="center" sx={{ width: "10%" }}><b>Formato</b></TableCell>
                                        <TableCell sx={{ width: "60%" }}><b>Nombre</b></TableCell>
                                        <TableCell align="center" sx={{ width: "30%" }}><b>Acciones</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {plantillasFiltradas.map((plantilla) => (
                                        <TableRow key={plantilla.id} hover>
                                            <TableCell align="center" sx={{ width: "10%" }}>
                                                <Box display="flex" justifyContent="center" alignItems="center">
                                                    {plantilla.nombre.endsWith(".docx") ? (
                                                        <FaFileWord size={24} className="text-blue-600" />
                                                    ) : (
                                                        <FaFileExcel size={24} className="text-green-600" />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ width: "60%", paddingLeft: "16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {plantilla.nombre}
                                            </TableCell>
                                            <TableCell align="center" sx={{ width: "30%" }}>
                                                <Tooltip title="Eliminar">
                                                    <IconButton color="error" onClick={() => handleDelete(plantilla.id)}>
                                                        <Trash2 size={20} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </TableContainer>
                    </div>
                );
            })}
        </div>
    );
}

export default Plantillas;
