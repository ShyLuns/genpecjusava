import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Button, MenuItem, TextField, Grid, Typography, Modal, Fade, Backdrop } from "@mui/material";
import { X, Save } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

const ModalEditar = ({ empresa, onClose, onEmpresaEditada }) => {
    const [formData, setFormData] = useState({
        nombre: "", codigo_ciiu: "", actividad_economica: "", numero_empleados: 0,
        direccion: "", correo: "", telefono: "", diseno: "", responsable_psb: "",
        representante_legal: "", ciudad: "", nit: "", digito_v: 0, tipo: "",
        tipo_empresa: "", conjugacion: "", conjugacion_ii: "", gentilicio: "",
        telefono_sst: "", correo_sst: "", nr: "", matricula_cc: "", dato_2121_7: ""
    });

    const tiposEmpresa = ["Bar", "Piscina", "Parque", "Iglesia", "Colegio"];

    useEffect(() => {
        if (empresa) {
            setFormData({ ...empresa });
        }
    }, [empresa]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({ ...formData, [name]: type === "number" ? Number(value) : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        // Validación simple de NIT vacío
        if (!formData.nit) {
            Swal.fire("Error", "El campo NIT no puede estar vacío", "error");
            return;
        }

        const { created_at, ...dataToSend } = formData;

        try {
            const response = await fetch(`${API_URL}/empresas/${empresa.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Error al actualizar empresa");

            Swal.fire("Éxito", "Empresa actualizada correctamente", "success").then(() => {
                window.location.reload();
            });

            if (typeof onEmpresaEditada === "function") {
                onEmpresaEditada();
            }

            onClose();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    return (
        <Modal open={true} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
            <Fade in={true}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl transition-all">
                    <Typography variant="h5" className="font-bold text-gray-700 pb-4">
                        Editar Empresa
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {[["nombre", "Nombre"], ["codigo_ciiu", "Código CIIU"], ["actividad_economica", "Actividad"],
                            ["direccion", "Dirección"], ["correo", "Correo", "email"], ["telefono", "Teléfono"],
                            ["diseno", "Diseño"], ["responsable_psb", "Responsable PSB"], ["representante_legal", "Representante Legal"],
                            ["ciudad", "Ciudad"], ["nit", "NIT"], ["conjugacion", "Conjugación"],
                            ["conjugacion_ii", "Conjugación 2"], ["gentilicio", "Gentilicio"], ["telefono_sst", "Teléfono SST"],
                            ["correo_sst", "Correo SST", "email"], ["nr", "NR"], ["dato_2121_7", "Dato 2121/7"], ["matricula_cc", "Matrícula CC"]
                            ].map(([name, label, type = "text"]) => (
                                <Grid item xs={12} sm={6} key={name}>
                                    <TextField
                                        fullWidth
                                        label={label}
                                        name={name}
                                        type={type}
                                        value={formData[name] || ""}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                        multiline={name === "actividad_economica"}
                                        minRows={name === "actividad_economica" ? 3 : undefined}
                                        maxRows={name === "actividad_economica" ? 6 : undefined}
                                    />
                                </Grid>
                            ))}

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Tipo" name="tipo" value={formData.tipo || ""}
                                    onChange={handleChange} variant="outlined" size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Tipo de Empresa" name="tipo_empresa"
                                    value={formData.tipo_empresa || ""} onChange={handleChange}
                                    variant="outlined" size="small"
                                >
                                    <MenuItem value="">Seleccione un tipo de empresa</MenuItem>
                                    {tiposEmpresa.map((tipo, index) => (
                                        <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Número de empleados" name="numero_empleados"
                                    type="number" value={formData.numero_empleados === "" ? "" : formData.numero_empleados}
                                    onChange={handleChange} variant="outlined" size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Dígito Verificación" name="digito_v" type="number"
                                    value={formData.digito_v === "" ? "" : formData.digito_v}
                                    onChange={handleChange} variant="outlined" size="small"
                                />
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
                                        color: "#b71c1c",
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
                                        background: "linear-gradient(135deg, #1565C0, #0D47A1)",
                                    }
                                }}
                            >
                                Guardar
                            </Button>
                        </div>
                    </form>
                </div>
            </Fade>
        </Modal>
    );
};

export default ModalEditar;
