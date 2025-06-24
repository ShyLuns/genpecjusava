import React, { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { TextField, Button, Alert } from "@mui/material";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";


function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleReset = async () => {
        setMessage("");

        try {
            await axios.post(`${API_URL}/auth/reset-password`, {
                token,
                nuevaContrasena: password,
            });

            setMessage("✅ Contraseña restablecida con éxito.");
            setTimeout(() => navigate("/"), 3000);
        } catch (error) {
            setMessage("⚠️ Error al restablecer la contraseña.");
        }
    };


    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4 text-center">Restablecer Contraseña</h2>

                {message && <Alert severity="info" className="mb-4">{message}</Alert>}

                <TextField
                    label="Nueva Contraseña"
                    type="password"
                    fullWidth
                    variant="outlined"
                    size="small"
                    margin="dense"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    onClick={handleReset}
                    variant="contained"
                    color="primary"
                    fullWidth
                    className="mt-4"
                >
                    Restablecer Contraseña
                </Button>
            </div>
        </div>
    );
}

export default ResetPassword;
