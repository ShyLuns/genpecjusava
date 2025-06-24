import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import axios from "axios";
import {
    Modal,
    TextField,
    Button,
    Alert,
    IconButton,
    Box,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function RecoverPassword({ open, onClose }) {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";
    const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

    const handleRecover = async () => {
        setMessage("");
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/auth/recover`, { correo: email });
            const resetToken = res.data.resetToken;
            const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

            await emailjs.send(
                "service_bsd5rwq",
                "template_bo2xktz",
                {
                    to_email: email,
                    reset_link: resetLink,
                },
                "OwzyLDoRy3_hAU8Cf"
            );

            setMessage("📩 Se ha enviado un enlace para restablecer tu contraseña.");
        } catch (error) {
            console.error("Error en recuperación:", error);
            setMessage("⚠️ No se pudo enviar el correo. Inténtalo más tarde.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal open={open} onClose={onClose} className="flex justify-center items-center">
            <Box
                sx={{
                    position: "relative",
                    backgroundColor: "white",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                    width: "100%",
                    maxWidth: 500,
                    mx: "auto"
                }}
            >
                {/* Botón de cierre */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" component="h2" align="center" gutterBottom>
                    Recuperar Contraseña
                </Typography>

                <Typography variant="body1" align="left" gutterBottom color="textSecondary">
                    Recupera tu contraseña por medio de tu correo electrónico.
                </Typography>

                {message && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}

                <TextField
                    label="Correo electrónico"
                    type="email"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Button
                    onClick={handleRecover}
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                    sx={{ mt: 2, py: 1.5, fontSize: "1rem" }}
                >
                    {loading ? "Enviando..." : "Recuperar Contraseña"}
                </Button>
            </Box>
        </Modal>
    );
}

export default RecoverPassword;
