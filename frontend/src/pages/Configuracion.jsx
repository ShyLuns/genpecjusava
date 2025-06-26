import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Home, LogOut, Users, FileText } from "lucide-react";
import { IconButton, Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2"; // ← IMPORTANTE

function Configuracion() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const nombreUsuario = localStorage.getItem("nombre") || "Usuario";
    const correo = localStorage.getItem("correo");
    const apellidoUsuario = localStorage.getItem("apellido");

    // 🔹 Estados para editar
    const [nombre, setNombre] = useState(nombreUsuario);
    const [apellido, setApellido] = useState(apellidoUsuario);
    const [email, setEmail] = useState(correo);

    const handleLogout = () => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "Se cerrará tu sesión actual.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem("token");
                localStorage.removeItem("nombre");
                localStorage.removeItem("correo");
                navigate("/");
            }
        });
    };

    // 🔹 Función para guardar cambios
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        try {
            fetch(`${API_URL}/usuarios/actualizar`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    correo: email
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("nombre", nombre);
                localStorage.setItem("correo", email);
                localStorage.setItem("apellido", apellido);

                Swal.fire("Éxito", "Tu información ha sido actualizada correctamente.", "success");
            } else {
                Swal.fire("Error", data.message || "No se pudo actualizar la información.", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Ocurrió un error al actualizar. Intenta más tarde.", "error");
        }
    };



    return (
        <div className="flex">
            {/* Sidebar */}
            <div
                className={`fixed left-0 top-16 bg-gray-900 text-white h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"
                    }`}
                onMouseEnter={() => setIsSidebarOpen(true)}
                onMouseLeave={() => setIsSidebarOpen(false)}
            >
                <div>
                    <nav className="space-y-4 mt-8">
                        {location.pathname === "/configuracion" && (
                            <Link to="/dashboard" className="relative flex items-center p-2 rounded hover:bg-gray-700">
                                <Home size={24} className="min-w-[24px]" />
                                <div
                                    className={`absolute left-12 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"}`}
                                >
                                    <span className="text-lg">Inicio</span>
                                </div>
                            </Link>
                        )}

                        <Link to="/empresas" className="relative flex items-center p-2 rounded hover:bg-gray-700">
                            <Briefcase size={24} className="min-w-[24px]" />
                            <div
                                className={`absolute left-12 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"}`}
                            >
                                <span className="text-lg">Empresas</span>
                            </div>
                        </Link>

                        <Link to="/empresas" className="relative flex items-center p-2 rounded hover:bg-gray-700">
                            <Users size={24} className="min-w-[24px]" />
                            <div
                                className={`absolute left-12 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"}`}
                            >
                                <span className="text-lg">Usuarios</span>
                            </div>
                        </Link>

                        <Link to="/empresas" className="relative flex items-center p-2 rounded hover:bg-gray-700">
                            <FileText size={24} className="min-w-[24px]" />
                            <div
                                className={`absolute left-12 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"}`}
                            >
                                <span className="text-lg">Plantillas</span>
                            </div>
                        </Link>
                    </nav>
                </div>
                <div className="mb-4">
                    <button
                        onClick={handleLogout}
                        className="relative flex items-center p-2 rounded hover:bg-red-700 text-red-400 whitespace-nowrap"
                    >
                        <LogOut size={24} className="min-w-[24px]" />
                        <div
                            className={`absolute left-12 overflow-hidden transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"}`}
                        >
                            <span className="text-lg">Cerrar Sesión</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className={`flex flex-col flex-1 pt-20 min-h-[calc(100vh-4rem)] px-6 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
                {/* Navbar */}
                <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white flex justify-between items-center px-6 py-4 shadow-lg z-50">
                    <h1 className="text-xl font-bold">Configuración del Usuario</h1>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:block">{nombreUsuario}</span>
                        <Link to="/configuracion">
                            <IconButton>
                                <Avatar alt="Perfil" src="/profile.jpg" />
                            </IconButton>
                        </Link>
                    </div>
                </nav>

                {/* Página de configuración */}
                <div className="bg-white p-6 rounded-xl shadow space-y-6 text-gray-700">
                    <h3 className="text-3xl font-bold text-gray-800">Editar Información</h3>

                    <form
                        onSubmit={handleSubmit} // ← Aquí
                        className="space-y-6 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-md max-w-xl mx-auto"
                    >
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-1">
                                Nombre completo
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="apellido" className="block text-sm font-semibold text-gray-700 mb-1">
                                Apellido
                            </label>
                            <input
                                type="text"
                                id="apellido"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={correo}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div className="text-sm text-gray-600 bg-yellow-100 p-4 rounded-lg border border-yellow-300">
                            Para cambiar tu contraseña, cierra sesión y haz clic en <span className="font-medium">¿Olvidaste tu contraseña?</span> en la pantalla de inicio.
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                            Guardar Cambios
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Configuracion;
