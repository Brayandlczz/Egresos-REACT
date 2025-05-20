"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const historial = [
  {
    periodo: "9/3/2025 al 13/3/2025",
    dias: 5,
    fechaSolicitud: "14/2/2025",
    estado: "Aprobado",
  },
  {
    periodo: "19/12/2024 al 30/12/2024",
    dias: 8,
    fechaSolicitud: "14/11/2024",
    estado: "Aprobado",
  },
];

const Vacaciones: React.FC = () => {
  const router = useRouter();
  const total = 15;
  const utilizados = 5;
  const restantes = total - utilizados;

return (
  <div className="p-6 space-y-6">
    <div className="flex items-center">
      <button
        onClick={() => router.back()}
        className="mr-2 p-2 rounded-full hover:bg-gray-100"
        aria-label="Volver"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="text-xl font-semibold">Volver</h1>
    </div>

    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-semibold">Vacaciones</h1>
      <a
        href="/solicitud-vacaciones"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block text-center"
      >
        + Solicitar Vacaciones
      </a>
    </div>

    <div className="flex flex-col md:flex-row gap-6">
      <div className="bg-white border rounded-lg p-4 shadow-sm md:w-1/3 h-auto">
        <h2 className="text-lg font-bold mb-2">Resumen de Vacaciones</h2>
        <div className="text-gray-500 space-y-1">
          <p>
            <strong>Periodo:</strong>
            <span className="font-bold text-gray-800 float-right text-right">2025</span>
          </p>
          <p>
            <strong>Días disponibles:</strong>
            <span className="font-bold text-gray-800 float-right text-right">{total}</span>
          </p>
          <p>
            <strong>Días utilizados:</strong>
            <span className="font-bold text-gray-800 float-right text-right">{utilizados}</span>
          </p>
          <p>
            <strong>Días restantes:</strong>
            <span className="font-bold text-gray-800 float-right text-right">{restantes}</span>
          </p>
        </div>

        <div className="mt-4">
          <div className="h-3 bg-gray-200 rounded-full">
            <div
              className="h-3 bg-blue-600 rounded-full"
              style={{ width: `${(utilizados / total) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-center text-gray-500 mt-1">
            Has utilizado {utilizados} de {total} días
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm md:flex-1 overflow-auto">
        <h2 className="text-lg font-bold mb-2">Historial de Vacaciones</h2>
        <table className="w-full text-sm text-gray-500">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1">Periodo</th>
              <th className="py-1 text-right">Días</th>
              <th className="py-1 text-right">Fecha de Solicitud</th>
              <th className="py-1 text-right">Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="font-bold text-gray-800 py-2">{item.periodo}</td>
                <td className="font-bold text-gray-800 py-2 text-right">{item.dias}</td>
                <td className="font-bold text-gray-800 py-2 text-right">{item.fechaSolicitud}</td>
                <td className="py-2 text-right">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">
                    {item.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
}
export default Vacaciones;
