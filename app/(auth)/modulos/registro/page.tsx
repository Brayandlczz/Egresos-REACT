'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { Atom } from "react-loading-indicators";

const RegistroAsignatura: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [planteles, setPlanteles] = useState<any[]>([]);
  const [ofertasEducativas, setOfertasEducativas] = useState<any[]>([]);

  const [plantelId, setPlantelId] = useState('');
  const [ofertaId, setOfertaId] = useState('');
  const [nombreAsignatura, setNombreAsignatura] = useState('');
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
        setPlanteles(data ?? []);
      }
    };

    cargarPlanteles();
  }, []);

  useEffect(() => {
    if (!plantelId) {
      setOfertasEducativas([]);
      return;
    }

    const cargarOfertas = async () => {
      const { data, error } = await supabase
        .from('oferta_educativa')
        .select('id, nombre_oferta')
        .eq('plantel_id', plantelId)
        .order('nombre_oferta', { ascending: true });

      if (error) {
        console.error('Error cargando ofertas educativas:', error);
      } else {
        setOfertasEducativas(data ?? []);
      }
    };

    cargarOfertas();
  }, [plantelId]);

  const handleGuardar = async () => {
    if (!plantelId || !ofertaId || !nombreAsignatura.trim()) {
      alert('Debe seleccionar un plantel, una oferta educativa y escribir el nombre del módulo.');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('asignatura')
      .insert([{
        nombre_asignatura: nombreAsignatura.trim(),
        plantel_id: plantelId,
        oferta_educativa_id: ofertaId,
      }]);

    setTimeout(() => setLoading(false), 1000);

    if (error) {
      console.error('Error al guardar el módulo:', error);
      alert('Ocurrió un error al registrar el módulo.');
    } else {
      setSuccessMessage('Módulo registrado con éxito!');
      setTimeout(() => {
        router.push('/modulos');
      }, 2000);
    }
  };

  const handleCancelar = () => {
    router.push('/modulos');
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
        <span className="font-bold text-black">Módulos</span> | Registro de módulos
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Datos del módulo a registrar
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

          <label className="block mb-2 font-medium">Oferta educativa perteneciente:</label>
          <select
            value={ofertaId}
            onChange={(e) => setOfertaId(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={!ofertasEducativas.length || loading}
          >
            <option value="">Seleccione una oferta educativa</option>
            {ofertasEducativas.map((oferta) => (
              <option key={oferta.id} value={oferta.id}>
                {oferta.nombre_oferta}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-medium">Nombre del módulo:</label>
          <input
            type="text"
            value={nombreAsignatura}
            onChange={(e) => setNombreAsignatura(e.target.value)}
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

export default RegistroAsignatura;
