import React from "react";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

const ModalEliminar = ({ empresa, onClose, onDeleteSuccess }) => {
    const handleDelete = async () => {
        const token = localStorage.getItem("token");

        Swal.fire({
            title: "¿Estás seguro?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`${API_URL}/empresas/${empresa.id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error("Error al eliminar la empresa");
                    }

                    Swal.fire("Eliminado", "La empresa ha sido eliminada", "success").then(() => {
                        onDeleteSuccess(); // Recargar la lista de empresas
                    });

                } catch (error) {
                    console.error("Error en la eliminación:", error);
                    Swal.fire("Error", error.message, "error");
                }
            }
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Eliminar Empresa</h2>
                <p>¿Estás seguro de que quieres eliminar la empresa <strong>{empresa.nombre}</strong>?</p>
                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded mr-2">Cancelar</button>
                    <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Eliminar</button>
                </div>
            </div>
        </div>
    );
};

export default ModalEliminar;
