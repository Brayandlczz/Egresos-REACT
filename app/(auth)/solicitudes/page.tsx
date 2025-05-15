"use client";

import React from "react";
import Link from "next/link";

export default function GestorSolicitudes() {
  const solicitudes = [
    {
      titulo: "Solicitud por Día",
      descripcion: "Pide un día libre por asuntos personales o administrativos.",
      ruta: "/permisos", 
    },
    {
      titulo: "Solicitud por Retardo",
      descripcion: "Justifica un retardo en tu horario laboral de entrada.",
      ruta: "/retardos",
    },
    {
      titulo: "Solicitud por Cumpleaños",
      descripcion: "Solicita el día libre por tu cumpleaños.",
      ruta: "/birthday"
    },
    {
      titulo: "Solicitud por Incapacidad",
      descripcion: "Ingresa una solicitud médica por incapacidad laboral.",
      ruta: "/incapacidad",
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
        Gestor de Solicitudes
      </h1>
      <p className="text-center text-gray-800 mb-8 whitespace-nowrap">
        Selecciona un tipo de solicitud para hacerla llegar a los encargados correspondientes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {solicitudes.map((solicitud, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 overflow-hidden"
          >
            <div className="bg-blue-100 px-4 py-3">
              <h2 className="text-md font-semibold text-gray-800 text-center">
                {solicitud.titulo}
              </h2>
            </div>
            <div className="p-5 flex-grow">
              <p className="text-gray-800 text-sm leading-relaxed text-center">
                {solicitud.descripcion}
              </p>
            </div>
            <div className="px-10 pb-5 text-center">
              <Link href={solicitud.ruta}>
                <button className="w-full bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Levantar solicitud
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
