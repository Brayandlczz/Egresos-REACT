'use client'

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { Atom } from "react-loading-indicators";

const RegistroCuentaBancaria: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [planteles, setPlanteles] = useState<any[]>([]);
  const [plantelId, setPlantelId] = useState('');
  const [nombreBanco, setNombreBanco] = useState('');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [razonSocial, setRazonSocial] = useState('');

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
  }, [supabase]);

  const handleGuardar = async () => {
    if (!plantelId || !nombreBanco.trim() || !numeroCuenta.trim() || !razonSocial.trim()) {
      alert('Debe llenar todos los campos.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('cuenta_banco')
      .insert([{
        plantel_id: plantelId,
        banco: nombreBanco,
        numero_cuenta: numeroCuenta,
        razon_social: razonSocial,
      }]);

    setTimeout(() => {
      setLoading(false);

      if (error) {
        console.error('Error guardando la cuenta bancaria:', error);
        alert('Error guardando la cuenta bancaria: ' + error.message);
      } else {
        setSuccessMessage('Cuenta bancaria registrada con éxito.');

        setTimeout(() => {
          router.push('/cuentas');  
        }, 2000);
      }
    }, 1000);
  };

  const handleCancelar = () => {
    router.push('/cuentas');  
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
        <span className="font-bold text-black">Cuentas</span> | Registro de Cuentas Bancarias
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Datos de la cuenta bancaria
        </div>

        <div className="p-4">
          <label className="block mb-2 font-medium">Plantel al que se asocia:</label>
          <select
            value={plantelId}
            onChange={(e) => setPlantelId(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          >
            <option value="">Seleccione un plantel del listado</option>
            {planteles.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre_plantel}</option>
            ))}
          </select>

          <label className="block mb-2 font-medium">Nombre del banco:</label>
          <input
            type="text"
            value={nombreBanco}
            onChange={(e) => setNombreBanco(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />

          <label className="block mb-2 font-medium">Número de cuenta:</label>
          <input
            type="text"
            value={numeroCuenta}
            onChange={(e) => setNumeroCuenta(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />

          <label className="block mb-2 font-medium">Razón social:</label>
          <input
            type="text"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
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

export default RegistroCuentaBancaria;
