"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Atom } from "react-loading-indicators";

const RegistroPlantel: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleGuardar = async () => {
    if (!nombre.trim()) return alert('Debe ingresar el nombre del plantel.');

    setLoading(true);

    const { error } = await supabase
      .from('plantel')
      .insert([{ nombre_plantel: nombre }]);

      setTimeout(() => {
      setLoading(false);
    }, 1000); 

    if (error) {
      console.error('Error guardando el plantel:', error);
      alert('Error guardando el plantel: ' + JSON.stringify(error));
    } else {
      setSuccessMessage('¡Plantel guardado con éxito!');
      setTimeout(() => {
        router.push('/planteles');
      }, 2000); 
    }
  };

  const handleCancelar = () => {
    router.push('/planteles');
  };

  return (
    <div className="relative p-8 bg-white-100 max-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <Atom color="#2464ec" size="large" text="" textColor="" />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded shadow">
          {successMessage}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">
        <span className="font-bold text-black">Planteles</span> | Registro de planteles
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Datos del plantel a registrar
        </div>

        <div className="p-4">
          <label className="block mb-2 font-medium">
            Ingrese el nombre del plantel:
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />

          <div className="flex justify-end items-center gap-2">
            <button
              onClick={handleCancelar}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroPlantel;
