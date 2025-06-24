import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Usuarios from "./pages/Usuarios";
import Plantillas from "./pages/Plantillas";
import Editor from "./pages/Editor";
import HistorialDocumentos from "./pages/HistorialDocumentos";
import ResetPassword from "./pages/ResetPassword";
import Configuracion from "./pages/Configuracion";
import { isAuthenticated, getTokenExpiration, logout } from "./utils/auth";

function PrivateRoute({ element }) {
  return isAuthenticated() ? element : <Navigate to="/" replace />;
}

function App() {
  const [isTokenValid, setIsTokenValid] = useState(isAuthenticated());

  useEffect(() => {
    if (!isTokenValid) {
      console.log("🔴 Token no válido. Redirigiendo al login...");
      return;
    }

    const expiration = getTokenExpiration();
    if (!expiration) return;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = expiration - currentTime;

    console.log(`⏳ Tiempo restante del token: ${timeLeft} segundos`);

    if (timeLeft <= 0) {
      console.log("🔴 Token expirado. Cerrando sesión...");
      logout();
      setIsTokenValid(false);
      return;
    }

    if (timeLeft <= 600) {
      console.log("⚠️ Advertencia: Menos de 10 minutos restantes.");
      Swal.fire({
        title: "Tu sesión está por expirar",
        text: "Por seguridad, serás desconectado en menos de 10 minutos.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
    }

    const interval = setInterval(() => {
      const newTime = Math.floor(Date.now() / 1000);
      const newTimeLeft = expiration - newTime;

      console.log(`⏳ Verificando... Quedan ${newTimeLeft} segundos`);

      if (newTimeLeft <= 0) {
        console.log("🔴 Token expirado. Cerrando sesión...");
        logout();
        setIsTokenValid(false);
        clearInterval(interval);
      }
    }, 5000); // 🔄 Reduce el intervalo a 5 segundos para pruebas rápidas

    return () => clearInterval(interval);
  }, [isTokenValid]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsTokenValid={setIsTokenValid} />} />
        <Route path="/dashboard" element={isTokenValid ? <Dashboard /> : <Navigate to="/" replace />} />
        <Route path="/empresas" element={isTokenValid ? <Empresas /> : <Navigate to="/" replace />} />
        <Route path="/usuarios" element={isTokenValid ? <Usuarios /> : <Navigate to="/" replace />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/plantillas" element={isTokenValid ? <Plantillas /> : <Navigate to="/" replace />} />
        <Route path="/editor" element={isTokenValid ? <Editor /> : <Navigate to="/" replace />} />
        <Route path="/historial" element={isTokenValid ? <HistorialDocumentos /> : <Navigate to="/" replace />} />
        <Route path="/reset-password" element={<ResetPassword />} /> {/* ✅ Ruta pública */}
      </Routes>
    </Router>
  );
}

export default App;
