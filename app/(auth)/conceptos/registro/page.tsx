"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ThreeDot } from "react-loading-indicators";

const RegistroConcepto: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [planteles, setPlanteles] = useState<any[]>([]);
  const [plantelId, setPlantelId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [status, setStatus] = useState('Activo');
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
    if (!plantelId || !descripcion.trim()) {
      alert('Debe seleccionar un plantel e ingresar la descripción del concepto de pago.');
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    const { error } = await supabase
      .from('concepto_pago')
      .insert([{ descripcion, status, plantel_id: plantelId }]);

    setTimeout(() => setLoading(false), 1000);

    if (error) {
      console.error('Error guardando el concepto:', error);
      alert('Error guardando el concepto: ' + JSON.stringify(error));
    } else {
      setSuccessMessage('¡Concepto de pago guardado con éxito!');
      setPlantelId('');
      setDescripcion('');
      setStatus('Activo');
      setTimeout(() => {
        router.push('/conceptos'); 
      }, 2000);
    }
  };

  const handleCancelar = () => {
    router.push('/conceptos'); 
  };

  return (
    <div className="relative p-8 bg-white-100 max-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <ThreeDot color="#2464ec" size="large" text="" textColor="" />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded shadow">
          {successMessage}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">
        <span className="font-bold text-black">Conceptos</span> | Registro de concepto de pago
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Datos del concepto de pago
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

          <label className="block mb-2 font-medium">Descripción:</label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />

        <label className="block mb-2 font-medium">Estatus:</label>
        <input
          type="text"
          value="Activo"
          readOnly
          className="w-full p-2 border rounded mb-4 bg-gray-100 cursor-not-allowed"
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

export default RegistroConcepto;
