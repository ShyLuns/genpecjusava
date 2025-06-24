import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  Modal, Fade, Backdrop, TextField, Button, MenuItem, Grid, Typography
} from "@mui/material";
import { X, Plus } from "lucide-react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

const ModalAgregar = ({ onClose, onEmpresaAgregada }) => {
  const [formData, setFormData] = useState({
    nombre: "", codigo_ciiu: "", actividad_economica: "", numero_empleados: "",
    direccion: "", correo: "", telefono: "", diseno: "", responsable_psb: "",
    representante_legal: "", ciudad: "", nit: "", digito_v: "",
    tipo: "", tipo_empresa: "", conjugacion: "", conjugacion_ii: "", gentilicio: "",
    telefono_sst: "", correo_sst: "", nr: "", matricula_cc: "", dato_2121_7: ""
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const tiposEmpresa = ["Bar", "Piscina", "Parque", "Iglesia", "Colegio"];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
      ...(name === "tipo" ? { tipo_empresa: value } : {})
    });

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "nombre", "codigo_ciiu", "actividad_economica", "numero_empleados",
      "direccion", "correo", "telefono", "diseno", "responsable_psb",
      "representante_legal", "ciudad", "nit", "digito_v", "tipo", "tipo_empresa"
    ];

    const errors = {};
    requiredFields.forEach(field => {
      if (!formData[field]) errors[field] = "Este campo es obligatorio";
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      Swal.fire("Error", "Por favor llena todos los campos obligatorios.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Error", "No estás autenticado", "error");
      return;
    }

    const cleanedData = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, v === "" ? null : v])
    );

    try {
      const response = await fetch(`${API_URL}/empresas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.message?.includes("NIT ya existe")) {
          setFieldErrors(prev => ({ ...prev, nit: "Este NIT ya está registrado" }));
        }
        throw new Error(data.message || "Error al agregar empresa");
      }

      Swal.fire("Éxito", "Empresa agregada correctamente", "success");
      onEmpresaAgregada();
      onClose();
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

    return (
        <Modal open={true} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300 }}>
            <Fade in={true}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl transition-all z-50">
                    <Typography variant="h5" className="font-bold text-gray-700 pb-4">
                        Agregar Empresa
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {[
                                ["nombre", "Nombre"], ["codigo_ciiu", "Código CIIU"], ["actividad_economica", "Actividad"],
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
                                        error={Boolean(fieldErrors[name])}
                                        helperText={fieldErrors[name] || ""}
                                        multiline={name === "actividad_economica"}
                                        minRows={name === "actividad_economica" ? 3 : undefined}
                                        maxRows={name === "actividad_economica" ? 6 : undefined}
                                    />
                                </Grid>
                            ))}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Tipo" name="tipo"
                                    value={formData.tipo || ""}
                                    onChange={handleChange}
                                    variant="outlined" size="small"
                                    error={Boolean(fieldErrors["tipo"])}
                                    helperText={fieldErrors["tipo"] || ""}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth select label="Tipo de Empresa" name="tipo_empresa"
                                    value={formData.tipo_empresa || ""}
                                    onChange={handleChange}
                                    variant="outlined" size="small"
                                    error={Boolean(fieldErrors["tipo_empresa"])}
                                    helperText={fieldErrors["tipo_empresa"] || ""}
                                >
                                    <MenuItem value="">Seleccione un tipo de empresa</MenuItem>
                                    {tiposEmpresa.map((tipo, index) => (
                                        <MenuItem key={index} value={tipo}>{tipo}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Número de empleados" name="numero_empleados"
                                    type="number"
                                    value={formData.numero_empleados}
                                    onChange={handleChange}
                                    variant="outlined" size="small"
                                    error={Boolean(fieldErrors["numero_empleados"])}
                                    helperText={fieldErrors["numero_empleados"] || ""}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth label="Dígito Verificación" name="digito_v" type="number"
                                    value={formData.digito_v}
                                    onChange={handleChange}
                                    variant="outlined" size="small"
                                    error={Boolean(fieldErrors["digito_v"])}
                                    helperText={fieldErrors["digito_v"] || ""}
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
                                startIcon={<Plus size={18} />}
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
                                Agregar Empresa
                            </Button>
                        </div>
                    </form>
                </div>
            </Fade>
        </Modal>
    );
};

export default ModalAgregar;
