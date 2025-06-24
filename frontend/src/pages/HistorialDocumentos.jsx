import React, { useEffect, useState } from "react";
import axios from "axios";

function HistorialDocumentos() {
    const [documentos, setDocumentos] = useState([]);

    const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchDocs = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(`${API_URL}/documentos/historial`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDocumentos(res.data);
            } catch (error) {
                console.error("Error cargando documentos:", error);
            }
        };

        fetchDocs();
    }, []);


    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="py-3 px-4">Documento</th>
                        <th className="py-3 px-4">Empresa</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Generado por</th>
                    </tr>
                </thead>
                <tbody>
                    {documentos.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{doc.nombre}</td>
                            <td className="py-2 px-4">{doc.empresa}</td>
                            <td className="py-2 px-4">
                                {doc.fecha_generacion
                                    ? new Date(doc.fecha_generacion).toLocaleDateString()
                                    : "Fecha no disponible"}
                            </td>
                            <td className="py-2 px-4">{doc.usuario}</td>
                        </tr>
                    ))}
                    {documentos.length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-400">
                                No hay documentos generados aún.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default HistorialDocumentos;
