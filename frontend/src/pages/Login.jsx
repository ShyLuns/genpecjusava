import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import {
    TextField, Button, IconButton, InputAdornment, CircularProgress, Alert, Link
} from "@mui/material";
import logo from "../assets/jsv.bmp"; // Ajusta el path si es diferente
import { Visibility, VisibilityOff } from "@mui/icons-material";
import RecoverPassword from "../components/RecoverPassword"; // ✅ Importar el modal
import background from "../assets/office2.jpg";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

function Login({ setIsTokenValid }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [openRecover, setOpenRecover] = useState(false); // ✅ Estado para abrir/cerrar el modal
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Por favor, introduce tu correo electrónico.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Introduce un correo electrónico válido.");
            return;
        }
        if (!password.trim()) {
            setError("Por favor, introduce tu contraseña.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                correo: email,
                contraseña: password,
            });

            console.log("Respuesta del backend:", res.data);

            // Guardamos token y nombre en localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("nombre", res.data.nombre || "Usuario");
            localStorage.setItem("apellido", res.data.apellido);
            localStorage.setItem("correo", res.data.correo);
            localStorage.setItem("rol", res.data.rol);



            // Notificamos a `App.jsx` que el usuario se autenticó
            setIsTokenValid(true);

            navigate("/dashboard");
        } catch (err) {
            console.error("Error en login:", err);
            if (err.response) {
                if (err.response.status === 401) {
                    setError("Contraseña incorrecta.");
                } else if (err.response.status === 404) {
                    setError("El correo no está registrado. Verifica y vuelve a intentarlo.");
                } else if (err.response.status === 403) {
                    Swal.fire({
                        icon: "warning",
                        title: "Usuario inactivo",
                        text: "Tu cuenta está desactivada. Contacta al administrador.",
                    });
                } else {
                    setError("Error en el servidor. Inténtalo más tarde.");
                }
            } else {
                setError("No se pudo conectar con el servidor.");
            }
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="bg-white/70 backdrop-blur-md p-6 rounded-lg shadow-xl w-96">
                <img src={logo} alt="Logo" className="w-32 h-auto mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h2>

                {/* Mostrar errores */}
                {error && <Alert severity="error" className="mb-4">{error}</Alert>}

                <form onSubmit={handleLogin}>
                    <TextField
                        label="Correo electrónico"
                        type="email"
                        fullWidth
                        variant="outlined"
                        size="small"
                        margin="dense"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Contraseña"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        variant="outlined"
                        size="small"
                        margin="dense"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* 🔹 Enlace para abrir el modal de recuperación */}
                    <div className="text-right mb-4">
                        <Link href="#" underline="hover" className="text-blue-500" onClick={() => setOpenRecover(true)}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                </form>

                {/* 🔹 Modal de recuperación de contraseña */}
                <RecoverPassword open={openRecover} onClose={() => setOpenRecover(false)} />
            </div>
        </div>
    );
}

export default Login;
