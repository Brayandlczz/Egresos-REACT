'use client';

import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

const contratos = [
  { nombre: 'CONTRATO | Servicio & Compra-venta (Persona Moral)', ruta: 'serviciocv-pm' },
  { nombre: 'CONTRATO | Servicio & Compra-venta (Persona Física)', ruta: 'serviciocv-pf' },
  { nombre: 'CONTRATO | Compra-venta (Persona Física)', ruta: 'compraventa-pf' },
  { nombre: 'CONTRATO | Compra-venta (Persona Moral)', ruta: 'compraventa-pm' },
  { nombre: 'CONTRATO | Servicio (Persona Física)', ruta: 'servicio-pf' },
  { nombre: 'CONTRATO | Servicio (Persona Moral)', ruta: 'servicio-pm' },
];

export default function ContratosPage() {
  return (
    <div className="max-h-screen p-10">
      <h1 className="text-3xl font-light text-center text-gray-800 mb-10">
        Generador de Contratos
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {contratos.map(({ nombre, ruta }) => (
          <Link
            key={ruta}
            href={`/contratos/${ruta}`}
            className="flex items-start gap-4 w-full max-w-md mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow hover:shadow-lg hover:border-blue-400 transition-all duration-200"
          >
            <FileText className="text-blue-500 w-8 h-8 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h2 className="text-lg font-medium text-gray-800">{nombre}</h2>
              <p className="text-sm text-gray-500 mt-1">Haz clic aquí para abrir el formulario</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
