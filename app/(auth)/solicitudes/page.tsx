"use client";

import React from "react";
import Link from "next/link";

export default function GestorSolicitudes() {
  const solicitudes = [
    {
      titulo: "Solicitud por Día",
      descripcion: "Pide un día libre por asuntos personales o administrativos.",
      ruta: "/solicitudes/solicitud-dia", 
    },
    {
      titulo: "Solicitud por Retardo",
      descripcion: "Justifica un retardo en tu horario laboral de entrada.",
      ruta: "/solicitudes/solicitud-retardos-form",
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
      <h1 className="text-2xl font-bold mb-3 text-center">Gestor de Solicitudes</h1>
      <p className="text-center text-gray-600 mb-6">
        Selecciona un tipo de solicitud para hacerla llegar a los encargados correspondientes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {solicitudes.map((solicitud, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-300 border border-gray-200 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg text-center font-semibold text-blue-600 mb-2">
                {solicitud.titulo}
              </h2>
              <p className="text-sm text-justify text-gray-600">{solicitud.descripcion}</p>
            </div>
            <div className="mt-4 text-right">
              <Link href={solicitud.ruta}>
                <span className="cursor-pointer text-sm text-blue-600 hover:underline hover:text-blue-800">
                  Levantar solicitud
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
