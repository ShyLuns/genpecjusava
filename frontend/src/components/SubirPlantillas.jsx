import React from "react";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000";

const SubirPlantillas = () => {
  const archivos = [
    { nombre: "Bar - Hotel XYZ - PEC.docx", tipo_empresa: "bar" },
    { nombre: "Bar - Hotel XYZ - Radicado.xlsx", tipo_empresa: "bar" },
    { nombre: "Piscina - Aqua - PEC.docx", tipo_empresa: "piscina" },
    // Agrega aquí todas las plantillas por defecto
  ];

  const subirPlantillas = async () => {
    const token = localStorage.getItem("token");

    for (const archivo of archivos) {
      const formData = new FormData();
      const response = await fetch(`/plantillas_defecto/${archivo.nombre}`);
      const blob = await response.blob();

      formData.append("archivo", new File([blob], archivo.nombre));
      formData.append("tipo_empresa", archivo.tipo_empresa);

      await fetch(`${API_URL}/plantillas`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }

    alert("✅ Plantillas resubidas correctamente");
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Resubir Plantillas Predeterminadas</h2>
      <button
        onClick={subirPlantillas}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Subir Plantillas por Defecto
      </button>
    </div>
  );
};

export default SubirPlantillas;
