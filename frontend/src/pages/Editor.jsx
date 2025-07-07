import React, { useState, useEffect } from "react";
import { Briefcase, FileText, X, Eye, Download } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

function Editor() {
    const [empresas, setEmpresas] = useState([]);
    const [plantillas, setPlantillas] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
    const [docURL, setDocURL] = useState(null);
    const [tipoArchivo, setTipoArchivo] = useState("");
    const [loading, setLoading] = useState(false);
    const [busquedaEmpresa, setBusquedaEmpresa] = useState("");


    useEffect(() => {
        const token = localStorage.getItem("token");

        axios.get(`${API_URL}/empresas`, {
            headers: { Authorization: `Bearer ${token}` },
        })

            .then(res => {
                const empresasConVisibilidad = res.data.map(emp => ({ ...emp, visible: true }));
                setEmpresas(empresasConVisibilidad);
            })
            .catch(err => console.error("Error cargando empresas:", err));

        axios.get(`${API_URL}/plantillas`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => setPlantillas(res.data))
            .catch(err => console.error("Error cargando plantillas:", err));
    }, []);

    const abrirModal = async (empresa) => {
        setEmpresaSeleccionada(empresa);
        setModalOpen(true);

        const token = localStorage.getItem("token");

        try {
            const res = await axios.get(`${API_URL}/plantillas`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlantillas(res.data);
        } catch (err) {
            console.error("Error recargando plantillas:", err);
        }
    };


    const cerrarModal = () => {
        setEmpresaSeleccionada(null);
        setPlantillaSeleccionada(null);
        setModalOpen(false);
        setDocURL(null);
    };

    const generarDocumento = async (idPlantilla) => {
        if (!empresaSeleccionada || !idPlantilla) return;

        const token = localStorage.getItem("token");

        try {
            setLoading(true); // ⏳ Comienza la carga
            const response = await axios.get(
                `${API_URL}/documentos/generar/${empresaSeleccionada.id}/${idPlantilla}`,
                {
                    responseType: "blob",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );


            if (response.data.size === 0) {
                console.error("❌ El archivo recibido está vacío.");
                return;
            }

            const tipoArchivo = response.headers["content-type"];
            console.log("🔍 Tipo de archivo recibido:", tipoArchivo);

            setDocURL(URL.createObjectURL(response.data));
            setPlantillaSeleccionada(idPlantilla);
            setTipoArchivo(tipoArchivo);

            console.log("✅ Documento generado correctamente.");
        } catch (error) {
            console.error("❌ Error al generar el documento:", error);
        } finally {
            setLoading(false); // ✅ Finaliza la carga, éxito o fallo
        }
    };


    const descargarDocumento = () => {
        if (!docURL || !plantillaSeleccionada || !tipoArchivo) return;

        const plantilla = plantillas?.find(p => p.id === plantillaSeleccionada);

        // 📌 Asignar extensión correcta según `tipoArchivo`
        const extension = tipoArchivo.includes("spreadsheet") ? "xlsx" : "docx";
        const nombreArchivo = `${empresaSeleccionada.nombre} - ${plantilla ? plantilla.nombre : "Documento"}.${extension}`;

        const link = document.createElement("a");
        link.href = docURL;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="p-6">
            {/* Header con botón para volver */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Generar Documentos</h1>

                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="flex items-center gap-2 bg-blue-100 text-blue-600 font-semibold px-4 py-2 rounded hover:bg-blue-200 transition"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6m-6 0h6m-6 0V9m0 6h.01"
                        />
                    </svg>
                    Volver al Dashboard
                </button>
            </div>

            {/* Filtro de búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar empresa..."
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                        const texto = e.target.value.toLowerCase();
                        setEmpresas(prev =>
                            prev.map(emp => ({
                                ...emp,
                                visible: emp.nombre.toLowerCase().includes(texto),
                            }))
                        );
                    }}

                />
            </div>

            {/* Listado de empresas */}
            {empresas.length > 0 ? (
                empresas.some(empresa => empresa.visible !== false) ? (
                    empresas.map((empresa) =>
                        empresa.visible !== false && (
                            <div
                                key={empresa.id}
                                className="mb-6 p-4 border rounded shadow-sm bg-white hover:shadow-md transition"
                            >
                                <h2 className="text-xl font-semibold mb-2">{empresa.nombre}</h2>
                                <p className="text-sm text-gray-500 mb-4">{empresa.tipo_empresa}</p>
                                <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded flex items-center gap-2"
                                    onClick={() => abrirModal(empresa)}
                                >
                                    <Briefcase size={18} />
                                    Seleccionar Empresa
                                </button>
                            </div>
                        )
                    )
                ) : (
                    <p className="text-center text-gray-500">No se encontraron empresas con ese nombre.</p>
                )
            ) : (
                <p className="text-center text-gray-500">No hay empresas registradas.</p>
            )}

            {modalOpen && empresaSeleccionada && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/80">
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-xl w-full max-w-md transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Documentos de: {empresaSeleccionada.nombre}
                            </h2>
                            <button
                                onClick={cerrarModal}
                                className="text-gray-400 hover:text-red-500 transition"
                                title="Cerrar"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <h3 className="text-lg font-medium mb-3 text-gray-700">Selecciona una plantilla:</h3>

                        {/* Filtro de búsqueda dentro del modal */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Buscar plantilla..."
                                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={busquedaEmpresa}
                                onChange={(e) => setBusquedaEmpresa(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            {plantillas.filter(p => p.tipo_empresa === empresaSeleccionada.tipo_empresa)
                                .filter(p => p.nombre.toLowerCase().includes(busquedaEmpresa.toLowerCase())) // Filtro dinámico de la búsqueda
                                .length > 0 ? (
                                plantillas
                                    .filter(p => p.tipo_empresa === empresaSeleccionada.tipo_empresa)
                                    .filter(p => p.nombre.toLowerCase().includes(busquedaEmpresa.toLowerCase())) // Filtro dinámico de la búsqueda
                                    .map((plantilla) => (
                                        <div
                                            key={plantilla.id}
                                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-100"
                                        >
                                            <FileText size={18} className="text-blue-500" />
                                            <span className="text-sm text-gray-800 truncate">{plantilla.nombre}</span>
                                            <button
                                                className="ml-auto bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-1 rounded transition"
                                                onClick={() => generarDocumento(plantilla.id)}
                                            >
                                                Generar
                                            </button>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-gray-500 text-sm">No se encontraron plantillas con ese nombre.</p>
                            )}
                        </div>

                        {/* Cargando / Documento generado */}
                        <div className="mt-5">
                            {docURL && !loading ? (
                                <div className="flex flex-col items-center text-center">
                                    <p className="text-green-600 font-medium mb-2">✅ Documento generado con éxito</p>
                                    <button
                                        onClick={descargarDocumento}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded flex items-center gap-2 transition"
                                    >
                                        <Download size={18} />
                                        Descargar Documento
                                    </button>
                                </div>
                            ) : loading ? (
                                <div className="flex justify-center items-center mt-3 text-blue-500">
                                    <svg
                                        className="animate-spin mr-2 h-5 w-5 text-blue-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        ></path>
                                    </svg>
                                    Generando documento...
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}


        </div>
    );


}

export default Editor;
