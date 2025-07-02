'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';

interface EstadoPago {
  id: string;
  estado: string;
  importe_esperado: number;
  importe_pagado: string;
  importe_restante: number;
  factura_folio: string;
  periodo_concatenado: string;
  seleccionado: boolean;
}

const EstadoPagoList: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [estados, setEstados] = useState<EstadoPago[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEstados = async () => {
    const { data, error } = await supabase
      .from('estado_pago')
      .select(`
        id,
        estado,
        importe_pagado,
        factura (
          folio
        ),
        periodo_pago (
          concatenado
        ),
        docente (
          importe_pago
        )
      `);

      if (error) {
        console.error('Error cargando estados de pago:', error.message);
        return;
      }

      if (data) {
      const mapeado = data.map((e: any) => {
        const esperado = Number(e.docente?.importe_pago) || 0;
        const pagado = Number(e.importe_pagado) || 0;
        return {
          id: e.id,
          estado: e.estado,
          importe_esperado: esperado,
          importe_pagado: pagado.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
          factura_folio: e.factura?.folio || 'Sin folio',
          periodo_concatenado: e.periodo_pago?.concatenado || 'Sin periodo',
          importe_restante: Number(e.docente?.importe_pago || 0) - Number(e.importe_pagado || 0),
          seleccionado: false,
        };
      });
        setEstados(mapeado);
      }
    };

    fetchEstados();
  }, [supabase]);

  const handleAgregar = () => {
    router.push('/estado-pago/register');
  };

  const handleEditar = (id: string) => {
    router.push(`/estado-pago/edit/${id}`);
  };

  const handleEliminar = async (id: string) => {
    const { error } = await supabase.from('estado_pago').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando estado de pago:', error.message);
      return;
    }
    setEstados((prev) => prev.filter((e) => e.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    const idsEliminar = estados.filter(e => e.seleccionado).map(e => e.id);
    if (idsEliminar.length === 0) return;

    const { error } = await supabase.from('estado_pago').delete().in('id', idsEliminar);
    if (error) {
      console.error('Error eliminando estados seleccionados:', error.message);
      return;
    }

    setEstados(estados.filter(e => !e.seleccionado));
  };

  const handleSeleccionar = (id: string) => {
    setEstados(prev =>
      prev.map(e =>
        e.id === id ? { ...e, seleccionado: !e.seleccionado } : e
      )
    );
  };

  const resultados = estados.filter((e) => {
    const query = search.toLowerCase();
    return (
      e.estado.toLowerCase().includes(query) ||
      e.factura_folio.toLowerCase().includes(query) ||
      e.periodo_concatenado.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-bold text-center text-black-800 mb-4">Listado de estados de pago</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por folio, periodo o estado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 text-left"></th>
              <th className="p-3 text-center text-nowrap">Folio de la factura</th>
              <th className="p-3 text-center text-nowrap">Periodo de pago</th>
              <th className="p-3 text-center text-nowrap">Estado de pago</th>
              <th className="p-3 text-center text-nowrap">Importe total de pago</th>
              <th className="p-3 text-center text-nowrap">Importe pagado</th>
              <th className="p-3 text-center text-nowrap">Importe restante</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No hay estados de pago registrados...
                </td>
              </tr>
            ) : (
              resultados.map((estado) => (
                <tr key={estado.id} className="border-t">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={estado.seleccionado}
                      onChange={() => handleSeleccionar(estado.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">{estado.factura_folio}</td>
                  <td className="p-3 text-center text-nowrap">{estado.periodo_concatenado}</td>
                  <td className="p-3 text-center text-nowrap">{estado.estado}</td>
                  <td className="p-3 text-center text-nowrap">${estado.importe_esperado.toLocaleString()}</td>
                  <td className="p-3 text-center text-nowrap">{estado.importe_pagado}</td>
                  <td className="p-3 text-center text-nowrap">${estado.importe_restante.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditar(estado.id)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded"
                        title="Editar"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleEliminar(estado.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstadoPagoList;
