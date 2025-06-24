import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// URL base del backend (ya configurada en .env.production)
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

const EmpresasTable = () => {
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await axios.get(`${API_URL}/empresas`);
      setEmpresas(response.data);
    } catch (error) {
      console.error("Error al obtener empresas", error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/empresas/${id}`);
        fetchEmpresas();
        Swal.fire("Eliminado!", "La empresa ha sido eliminada.", "success");
      } catch (error) {
        console.error("Error al eliminar empresa", error);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lista de Empresas</h2>
      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Correo</th>
            <th className="p-3 text-left">Teléfono</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((empresa) => (
            <tr key={empresa.id} className="border-b hover:bg-gray-100">
              <td className="p-3">{empresa.nombre}</td>
              <td className="p-3">{empresa.correo}</td>
              <td className="p-3">{empresa.telefono}</td>
              <td className="p-3 text-center">
                <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Editar</button>
                <button onClick={() => handleDelete(empresa.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmpresasTable;
