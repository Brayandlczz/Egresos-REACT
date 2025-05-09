"use client";

import React from "react";

export default function GestorSolicitudes() {
  const solicitudes = [
    {
      titulo: "Solicitud por Día",
      descripcion: "Pide un día libre por asuntos personales o administrativos.",
    },
    {
      titulo: "Solicitud por Retardo",
      descripcion: "Justifica un retardo en tu horario de entrada.",
    },
    {
      titulo: "Solicitud por Cumpleaños",
      descripcion: "Solicita el día libre en tu cumpleaños.",
    },
    {
      titulo: "Solicitud por Incapacidad",
      descripcion: "Ingresa una solicitud médica por incapacidad laboral.",
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Gestor de Solicitudes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {solicitudes.map((solicitud, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300 border border-gray-200 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg text-center font-semibold text-blue-600 mb-2">{solicitud.titulo}</h2>
              <p className="text-sm text-center text-gray-600">{solicitud.descripcion}</p>
            </div>
            <div className="mt-4 text-right">
              <button className="text-sm text-blue-600 hover:underline hover:text-blue-800">
                Levantar solicitud
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
