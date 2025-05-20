"use client";

import React from "react";
import Link from "next/link";
import { CalendarDays, Clock, Cake, HeartPulse, TreePalm } from "lucide-react";

export default function GestorSolicitudes() {
  const solicitudes = [
    {
      titulo: "Solicitud de Permiso",
      descripcion: "Solicita un lapso de tiempo por asuntos personales o administrativos.",
      ruta: "/permisos",
      icono: <CalendarDays className="h-6 w-6 text-blue-600" />,
    },
    {
      titulo: "Solicitud por Retardo",
      descripcion: "Justifica el motivo de tu retraso en el horario de entrada laboral.",
      ruta: "/retardos",
      icono: <Clock className="h-6 w-6 text-blue-600" />,
    },
    {
      titulo: "Solicitud por Cumpleaños",
      descripcion: "Solicita el día libre para festejar tu cumpleaños con tus seres queridos.",
      ruta: "/birthday",
      icono: <Cake className="h-6 w-6 text-blue-600" />,
    },
    {
      titulo: "Solicitud por Incapacidad",
      descripcion: "Solicita un permiso laboral por incapacidad médica.",
      ruta: "/incapacidad",
      icono: <HeartPulse className="h-6 w-6 text-blue-600" />,
    },
    {
      titulo: "Solicitud de vacaciones",
      descripcion: "Solicita un periodo vacacional utilizando tus días disponibles.",
      ruta: "/vacaciones",
      icono : <TreePalm className="h-6 w-6 text-blue-600"/>,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-center text-3xl font-bold mb-4 text-gray-800">
        Gestor de Solicitudes
      </h1>
      <p className="text-center text-gray-800 mb-8 whitespace">
        Selecciona un tipo de solicitud para hacerla llegar a los encargados correspondientes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solicitudes.map((solicitud, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {solicitud.titulo}
              </h2>
              <span>{solicitud.icono}</span>
            </div>

            <p className="text-gray-500 text-sm mb-6 text-center">
              {solicitud.descripcion}
            </p>

            <Link
              href={solicitud.ruta}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md text-center block transition-all"
            >
              Acceder
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
