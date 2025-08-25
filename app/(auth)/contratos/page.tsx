'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import GenerarContratoPSB from "@/app/(auth)/contratos/docx-components/servicio-compraventa";

const contratos = [
  { nombre: 'CONTRATO | Servicio & Compra-venta (Persona Física)', ruta: 'servicio-compraventa' },
  { nombre: 'CONTRATO | Servicio & Compra-venta (Persona Moral)', ruta: 'psb1' },
  { nombre: 'CONTRATO | Compra-venta (Persona Física)', ruta: 'docente' },
  { nombre: 'CONTRATO | Compra-venta (Persona Moral)', ruta: 'docente1' },
  { nombre: 'CONTRATO | Servicio (Persona Física)', ruta: 'proveedor' },
  { nombre: 'CONTRATO | Servicio (Persona Moral)', ruta: 'honorarios' },
];

export default function ContratosPage() {

  // Instancia el componente para usar la función generarContrato
  // Pero como es un componente React, no puedes llamar su función interna directamente.
  // Entonces extrae la función generarContrato a un archivo aparte para poder importarla y usarla aquí.
  // Por ahora, voy a sugerir extraer la función a un helper para importarla.

  return (
    <div className="max-h-screen p-10">
      <h1 className="text-3xl font-light text-center text-black-800 mb-10">
        Generador de Contratos
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {contratos.map(({ nombre, ruta }) => {
          if (ruta === 'servicio-compraventa') {
            // Mostrar botón que genera el contrato directamente
            return (
              <div
                key={ruta}
                className="flex items-start gap-4 w-full max-w-md mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow hover:shadow-lg hover:border-blue-400 transition-all duration-200"
              >
                <FileText className="text-blue-500 w-8 h-8 mt-1 flex-shrink-0" />
                <div className="text-left flex-1">
                  <h2 className="text-lg font-medium text-gray-800">{nombre}</h2>
                  <p className="text-sm text-gray-500 mt-1 mb-4">Haz clic aquí para generar este contrato</p>
                  <GenerarContratoPSB />
                </div>
              </div>
            );
          } else {
            // Para los demás, solo un botón que redirige a la ruta
            return (
              <button
                key={ruta}
                onClick={() => window.location.href = `/contratos/${ruta}`}
                className="flex items-start gap-4 w-full max-w-md mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow hover:shadow-lg hover:border-blue-400 transition-all duration-200"
              >
                <FileText className="text-blue-500 w-8 h-8 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h2 className="text-lg font-medium text-gray-800">{nombre}</h2>
                  <p className="text-sm text-gray-500 mt-1">Haz clic aquí para generar este contrato</p>
                </div>
              </button>
            );
          }
        })}
      </div>
    </div>
  );
}
