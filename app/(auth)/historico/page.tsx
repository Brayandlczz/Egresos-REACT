'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { generarHistoricoDocentePDF } from './generateHystoric/generarHistoricoDocentePDF.client.ts';

interface HistoricoItem {
  docente_relation_id: string;
  nombre_asignatura: string;
  fecha_inicio: string;
  fecha_fin: string;
  importe_total_pago: number;
  total_pagado: number;
  saldo_restante: number;
  primer_pago: string | null;
  ultimo_pago: string | null;
}

const HistoricoPagosDocente: React.FC = () => {
  const supabase = createClientComponentClient();

  const [docentes, setDocentes] = useState<{ id: string; nombre_docente: string }[]>([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<string>('');
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDocentes = async () => {
      const { data, error } = await supabase
        .from('docente')
        .select('id, nombre_docente')
        .order('nombre_docente');
      if (error) {
        setError('Error al cargar docentes: ' + error.message);
      } else {
        setDocentes(data || []);
      }
    };
    cargarDocentes();
  }, [supabase]);

  useEffect(() => {
    if (!docenteSeleccionado) {
      setHistorico([]);
      return;
    }

    const cargarHistorico = async () => {
      setCargando(true);
      setError(null);

      const { data, error } = await supabase.rpc('sp_historico_pagos_por_docente', {
        p_docente_id: docenteSeleccionado,
      });

      if (error) {
        setError('Error al cargar histórico: ' + error.message);
        setHistorico([]);
      } else {
        setHistorico(data || []);
      }

      setCargando(false);
    };

    cargarHistorico();
  }, [docenteSeleccionado, supabase]);

  const nombreDocente = docentes.find(d => d.id === docenteSeleccionado)?.nombre_docente || '';

  return (
    <div className="p-8 bg-gray-50 max-h-screen text-center">
      <h2 className="text-3xl font-light text-center text-black-800 mb-6">
        Histórico de Pagos por Docente
      </h2>

      <div className="mb-6 max-w-md mx-auto">
        <label htmlFor="docente" className="block mb-2 font-medium text-gray-700 text-center">
          Seleccione un docente:
        </label>
        <select
          id="docente"
          value={docenteSeleccionado}
          onChange={(e) => setDocenteSeleccionado(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 text-center"
        >
          <option value="">-- Seleccione --</option>
          {docentes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre_docente}
            </option>
          ))}
        </select>
      </div>

      {cargando && <p className="text-blue-600 font-semibold mb-4">Cargando histórico...</p>}

      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {historico.length > 0 && (
        <>
          <div className="overflow-x-auto shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Módulo
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Fecha de Inicio del Módulo
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Fecha de Fin del Módulo
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Importe de Pago Total
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Importe Cubierto
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Importe Restante
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Primer Pago
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Último Pago
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center whitespace-nowrap">
                    Estatus de Pago
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historico.map((item) => (
                  <tr key={item.docente_relation_id} className="hover:bg-gray-50 text-center">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {item.nombre_asignatura}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(item.fecha_inicio).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(item.fecha_fin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700 font-semibold whitespace-nowrap">
                      ${item.importe_total_pago.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-semibold whitespace-nowrap">
                      ${item.total_pagado.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-semibold whitespace-nowrap">
                      ${item.saldo_restante.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {item.primer_pago ? new Date(item.primer_pago).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {item.ultimo_pago ? new Date(item.ultimo_pago).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                      {item.total_pagado > item.importe_total_pago ? (
                        <span className="text-red-700">Excedido</span>
                      ) : item.total_pagado === item.importe_total_pago ? (
                        <span className="text-green-700">PAGADO</span>
                      ) : (
                        <span className="text-yellow-600">PENDIENTE</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => generarHistoricoDocentePDF(docenteSeleccionado, nombreDocente)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2.5 rounded flex items-center gap-2 justify-center mx-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="red"
                viewBox="0 0 24 24"
              >
                <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM14 3.5V9h5.5L14 3.5z" />
                <text x="7" y="18" fontWeight="bold" fontSize="7" fill="white">
                  PDF
                </text>
              </svg>
              Exportar Histórico
            </button>
          </div>
        </>
      )}

      {!cargando && !error && historico.length === 0 && docenteSeleccionado && (
        <p className="text-gray-600 mt-4">No se encontraron pagos para este docente.</p>
      )}
    </div>
  );
};

export default HistoricoPagosDocente;
