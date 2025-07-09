import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, LogOut, Users, FileText, Pencil } from "lucide-react";
import { IconButton, Avatar } from "@mui/material";
import Swal from "sweetalert2";

import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";


function Dashboard() {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [documentos, setDocumentos] = useState([]);
    const nombreUsuario = localStorage.getItem("nombre") || "Usuario";
    const rolUsuario = localStorage.getItem("rol") || "Sin rol";


    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("nombre");
        localStorage.removeItem("rol");
        navigate("/");
    };

    useEffect(() => {
        const fetchDocs = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(`${API_URL}/documentos/historial`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Documentos recibidos:", res.data);
                setDocumentos(res.data);
            } catch (error) {
                console.error("Error cargando documentos:", error);
            }
        };

        fetchDocs();
    }, []);

    const handleDeleteDocumento = async (id) => {
        const confirm = await Swal.fire({
            title: "¿Eliminar documento?",
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
            const response = await fetch(`${API_URL}/documentos/eliminar/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Error al eliminar");

            Swal.fire("¡Eliminado!", "El documento ha sido eliminado.", "success");
            fetchDocumentos(); // Asegúrate de tener esta función definida
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };


    // Calcular documentos a mostrar en la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentDocuments = documentos.slice(indexOfFirstItem, indexOfLastItem);

    // Número total de páginas
    const totalPages = Math.ceil(documentos.length / itemsPerPage);

    // Funciones para cambiar de página
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    };

    const goToPrevPage = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
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
                        <Link to="/empresas" className="relative flex items-center p-2 rounded hover:bg-gray-700">
                            <Briefcase size={24} />
                            <div
                                className={`absolute left-12 transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"
                                    }`}
                            >
                                <span className="text-lg">Empresas</span>
                            </div>
                        </Link>
                        <Link to="/usuarios" className="relative flex items-center p-2 rounded hover:bg-gray-700">
                            <Users size={24} />
                            <div
                                className={`absolute left-12 transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"
                                    }`}
                            >
                                <span className="text-lg">Usuarios</span>
                            </div>
                        </Link>
                        <Link to="/plantillas" className="relative flex items-center p-2 rounded hover:bg-gray-700">
                            <FileText size={24} />
                            <div
                                className={`absolute left-12 transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"
                                    }`}
                            >
                                <span className="text-lg">Plantillas</span>
                            </div>
                        </Link>
                        <Link to="/editor" className="relative flex items-center p-2 rounded hover:bg-gray-700">
                            <Pencil size={24} />
                            <div
                                className={`absolute left-12 transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"
                                    }`}
                            >
                                <span className="text-lg">Generar</span>
                            </div>
                        </Link>

                    </nav>
                </div>

                <div className="mb-4">
                    <button
                        onClick={handleLogout}
                        className="relative flex items-center p-2 rounded hover:bg-red-700 text-red-400"
                    >
                        <LogOut size={24} />
                        <div
                            className={`absolute left-12 transition-all duration-300 ${isSidebarOpen ? "opacity-100 delay-200" : "opacity-0"
                                }`}
                        >
                            <span className="text-lg">Cerrar Sesión</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Contenedor principal */}
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
                {/* Navbar */}
                <nav className="fixed top-0 left-0 w-full h-24 bg-gray-800 text-white px-4 flex items-center justify-between z-50">
                    <h1 className="text-xl font-bold">Generador de Documentos Jusava.net</h1>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right leading-tight">
                            <span className="font-semibold">{nombreUsuario}</span>
                            <span className="text-sm text-gray-300">{rolUsuario}</span>
                        </div>

                        <Link to="/configuracion">
                            <IconButton>
                                <Avatar alt="Perfil" src="/profile.jpg" />
                            </IconButton>
                        </Link>
                    </div>
                </nav>


                {/* Contenido */}
                <div className="mt-16 px-6 py-10 max-w-7xl mx-auto w-full">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">¡Bienvenido, {nombreUsuario}!</h2>

                    <div className="bg-white p-8 rounded-xl shadow-lg mb-10">
                        <h3 className="text-2xl font-semibold mb-4 text-blue-600">¿Cómo comenzar?</h3>
                        <ol className="list-decimal list-inside space-y-3 text-gray-700">
                            <li>
                                Ve al apartado <strong>Empresas</strong> y registra los datos de la empresa.
                            </li>
                            <li>
                                Luego dirígete a <strong>Plantillas</strong> y sube las plantillas correspondientes.
                            </li>
                            <li>
                                Accede a <strong>Generar Documentos</strong> para crear automáticamente tus documentos
                                personalizados.
                            </li>
                        </ol>
                        <p className="mt-4 text-sm text-gray-500">
                            Puedes volver aquí cuando lo necesites. Esta plataforma está diseñada para ser rápida,
                            intuitiva y segura.
                        </p>
                    </div>

                    <div className="mb-12">
                        <Link
                            to="/editor"
                            className="inline-flex items-center gap-3 px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all duration-300 ease-in-out rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                        >
                            <Pencil size={22} className="animate-pulse" />
                            <span>Generar Documentos</span>
                        </Link>
                    </div>



                    {/* Tabla de documentos generados */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">
                            Historial de Documentos Generados
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-gray-700">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="py-3 px-4">Documento</th>
                                        <th className="py-3 px-4">Empresa</th>
                                        <th className="py-3 px-4">Fecha</th>
                                        <th className="py-3 px-4">Generado por</th>
                                        <th className="py-3 px-4">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDocuments.map((doc) => (
                                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                                            <td className="py-2 px-4">{doc.nombre}</td>
                                            <td className="py-2 px-4">{doc.empresa}</td>
                                            <td className="py-2 px-4">
                                                {doc.fecha_generacion
                                                    ? new Date(doc.fecha_generacion).toLocaleDateString()
                                                    : "Fecha no disponible"}
                                            </td>
                                            <td className="py-2 px-4">{doc.usuario}</td>
                                            <td className="py-2 px-4">
                                                <button
                                                    onClick={() => handleDeleteDocumento(doc.id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {documentos.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-4 text-center text-gray-400">
                                                No hay documentos generados aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>

                        {/* Controles de paginación */}
                        {documentos.length > itemsPerPage && (
                            <div className="flex justify-center mt-4 gap-2">
                                <button
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    Anterior
                                </button>

                                {[...Array(totalPages)].map((_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`px-3 py-1 rounded ${currentPage === page
                                                ? "bg-blue-800 text-white"
                                                : "bg-blue-600 text-white hover:bg-blue-700"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded ${currentPage === totalPages
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
