"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Atom } from "react-loading-indicators";

const RegistroDepartamento: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [planteles, setPlanteles] = useState<any[]>([]);
  const [plantelId, setPlantelId] = useState('');
  const [nombreDepartamento, setNombreDepartamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const cargarPlanteles = async () => {
      const { data, error } = await supabase
        .from('plantel')
        .select('id, nombre_plantel')
        .order('nombre_plantel', { ascending: true });

      if (error) {
        console.error('Error cargando planteles:', error);
      } else {
        setPlanteles(data);
      }
    };

    cargarPlanteles();
  }, []);

  const handleGuardar = async () => {
    if (!plantelId || !nombreDepartamento.trim()) {
      alert('Debe seleccionar un plantel e ingresar el nombre del departamento.');
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    const { error } = await supabase
      .from('departamentos')
      .insert([{ 
        nombre_departamento: nombreDepartamento.trim(), 
        plantel_id: plantelId 
      }]);

    setTimeout(() => setLoading(false), 1000);

    if (error) {
      console.error('Error guardando el departamento:', error);
      alert('Error guardando el departamento: ' + JSON.stringify(error));
    } else {
      setSuccessMessage('¡Departamento registrado con éxito!');
      setPlantelId('');
      setNombreDepartamento('');
      setTimeout(() => {
        router.push('/areas');
      }, 2000);
    }
  };

  const handleCancelar = () => {
    router.push('/areas');
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
        <span className="font-bold text-black">Departamentos</span> | Registro de departamento
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Datos del departamento
        </div>

        <div className="p-4">
          <label className="block mb-2 font-medium">Plantel al que se asocia:</label>
          <select
            value={plantelId}
            onChange={(e) => setPlantelId(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          >
            <option value="">Seleccione un plantel</option>
            {planteles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_plantel}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-medium">Nombre del departamento:</label>
          <input
            type="text"
            value={nombreDepartamento}
            onChange={(e) => setNombreDepartamento(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />

          <div className="flex justify-end gap-2">
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

export default RegistroDepartamento;
