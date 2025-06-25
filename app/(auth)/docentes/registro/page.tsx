'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const RegistroDocente: React.FC = () => {
  const supabase = createClientComponentClient();

  const [planteles, setPlanteles] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);
  const [ofertas, setOfertas] = useState<any[]>([]);
  const [asignaturas, setAsignaturas] = useState<any[]>([]);

  const [importeActual, setImporteActual] = useState('');

  const [plantelId, setPlantelId] = useState('');
  const [plantelNombre, setPlantelNombre] = useState('Seleccione un plantel');

  const [nombreDocente, setNombreDocente] = useState('');

  const [selecciones, setSelecciones] = useState<any[]>([]);

  const [ofertaId, setOfertaId] = useState('');
  const [ofertaNombre, setOfertaNombre] = useState('Seleccione una oferta educativa');
  const [asignaturaId, setAsignaturaId] = useState('');
  const [asignaturaNombre, setAsignaturaNombre] = useState('Seleccione una asignatura');
  const [periodoPago, setPeriodoPago] = useState('');
  const [periodoNombre, setPeriodoNombre] = useState('Seleccione un período');

  useEffect(() => {
    const cargarPlanteles = async () => {
      const { data, error } = await supabase.from('plantel').select('id, nombre_plantel').order('nombre_plantel', { ascending: true });
      if (error) console.error('Error cargando planteles:', error);
      else setPlanteles(data || []);
    };
    cargarPlanteles();
  }, []);

  useEffect(() => {
    const cargarPeriodos = async () => {
      if (!plantelId) return setPeriodos([]);
      const { data, error } = await supabase.from('periodo_pago').select('id, concatenado').eq('plantel_id', plantelId).order('concatenado');
      if (error) console.error('Error cargando períodos:', error);
      else setPeriodos(data || []);
    };
    cargarPeriodos();
  }, [plantelId]);

  useEffect(() => {
    const cargarOfertas = async () => {
      if (!plantelId) return setOfertas([]);
      const { data, error } = await supabase.from('oferta_educativa').select('id, nombre_oferta').eq('plantel_id', plantelId).order('nombre_oferta');
      if (error) console.error('Error cargando ofertas:', error);
      else setOfertas(data || []);
    };
    cargarOfertas();
  }, [plantelId]);

  useEffect(() => {
    const cargarAsignaturas = async () => {
      if (!ofertaId) return setAsignaturas([]);
      const { data, error } = await supabase.from('asignatura').select('id, nombre_asignatura').eq('oferta_educativa_id', ofertaId).order('nombre_asignatura');
      if (error) console.error('Error cargando asignaturas:', error);
      else setAsignaturas(data || []);
    };
    cargarAsignaturas();
  }, [ofertaId]);

  const agregarSeleccion = () => {
    if (!ofertaId || !asignaturaId || !periodoPago) {
      alert('Debes seleccionar una oferta educativa, asignatura y período.');
      return;
    }

    if (!importeActual.trim()) {
      alert('Debes ingresar un importe para esta relación.');
      return;
    }

    const importeParsed = parseFloat(importeActual);
    if (isNaN(importeParsed) || importeParsed <= 0) {
      alert('El importe debe ser un número positivo válido.');
      return;
    }

    const duplicado = selecciones.some(s =>
      s.oferta_educativa_id === ofertaId &&
      s.asignatura_id === asignaturaId &&
      s.periodo_pago_id === periodoPago
    );

    if (duplicado) {
      alert('Esta relación ya fue agregada.');
      return;
    }

    setSelecciones([
      ...selecciones,
      {
        plantel_id: plantelId,
        plantelNombre,
        oferta_educativa_id: ofertaId,
        ofertaNombre,
        asignatura_id: asignaturaId,
        asignaturaNombre,
        periodo_pago_id: periodoPago,
        periodoNombre,
        importe_total_pago: importeParsed
      }
    ]);

    setOfertaId('');
    setOfertaNombre('Seleccione una oferta educativa');
    setAsignaturaId('');
    setAsignaturaNombre('Seleccione una asignatura');
    setPeriodoPago('');
    setPeriodoNombre('Seleccione un período');
    setImporteActual('');
  };

  const handleGuardar = async () => {
    if (!plantelId || !nombreDocente.trim() || selecciones.length === 0) {
      alert('Todos los campos son obligatorios, incluidas las relaciones.');
      return;
    }

    const { data, error } = await supabase
      .from('docente')
      .insert([{ nombre_docente: nombreDocente }])
      .select();

    if (error || !data) {
      console.error('Error insertando docente:', error);
      alert('No se pudo registrar el docente.');
      return;
    }

    const docente_id = data[0].id;

    const relaciones = selecciones.map(s => ({
      docente_id,
      plantel_id: s.plantel_id, 
      oferta_educativa_id: s.oferta_educativa_id,
      asignatura_id: s.asignatura_id,
      periodo_pago_id: s.periodo_pago_id,
      importe_total_pago: s.importe_total_pago
    }));

    const { error: relError } = await supabase.from('docente_relations').insert(relaciones);

    if (relError) {
      console.error('Error insertando relaciones:', relError);
      alert('Docente creado pero falló la asignación.');
    } else {
      alert('Docente y asignaciones guardadas exitosamente.');
      handleCancelar();
    }
  };

  const handleCancelar = () => {
    setPlantelId('');
    setPlantelNombre('Seleccione un plantel');
    setNombreDocente('');
    setOfertaId('');
    setOfertaNombre('Seleccione una oferta educativa');
    setAsignaturaId('');
    setAsignaturaNombre('Seleccione una asignatura');
    setPeriodoPago('');
    setPeriodoNombre('Seleccione un período');
    setImporteActual('');
    setSelecciones([]);
  };

  return (
    <div className="p-8 bg-white-100">
      <h2 className="text-2xl font-semibold mb-6">
        <span className="font-bold text-black">Docentes</span> | Registro de Docente
      </h2>

      <form role="form" className="border rounded shadow bg-white" onSubmit={e => e.preventDefault()}>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t" role="heading" aria-level={3}>
          Datos del docente
        </div>

        <div className="p-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="plantel" className="block mb-2 font-medium">Plantel:</label>
            <select
              id="plantel"
              name="plantel"
              aria-label="Plantel al que se asocia"
              value={plantelId}
              onChange={e => {
                setPlantelId(e.target.value);
                setPlantelNombre(planteles.find(p => p.id === e.target.value)?.nombre_plantel || 'Seleccione un plantel');
              }}
              className="w-full p-2 border rounded bg-white"
            >
              <option value="">Seleccione un plantel</option>
              {planteles.map(p => (
                <option key={p.id} value={p.id}>{p.nombre_plantel}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="docente" className="block mb-2 font-medium">Docente:</label>
            <input
              id="docente"
              name="docente"
              type="text"
              aria-label="Nombre del docente"
              placeholder="Escriba el nombre del docente"
              value={nombreDocente}
              onChange={e => setNombreDocente(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="oferta" className="block mb-2 font-medium">Oferta educativa:</label>
            <select
              id="oferta"
              name="oferta"
              aria-label="Oferta Educativa"
              disabled={!plantelId}
              value={ofertaId}
              onChange={e => {
                setOfertaId(e.target.value);
                setOfertaNombre(ofertas.find(o => o.id === e.target.value)?.nombre_oferta || 'Seleccione una oferta educativa');
              }}
              className={`w-full p-2 border rounded bg-white ${!plantelId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccione una oferta</option>
              {ofertas.map(o => (
                <option key={o.id} value={o.id}>{o.nombre_oferta}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="asignatura" className="block mb-2 font-medium">Asignatura:</label>
            <select
              id="asignatura"
              name="asignatura"
              aria-label="Asignatura"
              disabled={!ofertaId}
              value={asignaturaId}
              onChange={e => {
                setAsignaturaId(e.target.value);
                setAsignaturaNombre(asignaturas.find(a => a.id === e.target.value)?.nombre_asignatura || 'Seleccione una asignatura');
              }}
              className={`w-full p-2 border rounded bg-white ${!ofertaId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccione una asignatura</option>
              {asignaturas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre_asignatura}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="periodo" className="block mb-2 font-medium">Periodo de pago:</label>
            <select
              id="periodo"
              name="periodo"
              aria-label="Periodo de pago"
              disabled={!plantelId}
              value={periodoPago}
              onChange={e => {
                setPeriodoPago(e.target.value);
                setPeriodoNombre(periodos.find(p => p.id === e.target.value)?.concatenado || 'Seleccione un período');
              }}
              className={`w-full p-2 border rounded bg-white ${!plantelId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Seleccione un período</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.concatenado}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="importePago" className="block mb-2 font-medium">Importe Total de Pago(MXN):</label>
            <input
              id="importe"
              name="importe"
              type="number"
              aria-label="Importe de pago"
              placeholder="Cantidad en MXN"
              value={importeActual}
              onChange={e => setImporteActual(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="col-span-2">
            <button
              type="button"
              onClick={agregarSeleccion}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              aria-label="Agregar relación"
            >
              Agregar relación
            </button>
          </div>

          <div className="col-span-2">
            <h4 className="font-semibold mb-2">Relaciones agregadas:</h4>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 rounded table-auto">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border text-nowrap">Plantel</th>
                    <th className="p-2 border text-nowrap">Oferta educativa</th>
                    <th className="p-2 border text-nowrap">Asignatura designada</th>
                    <th className="p-2 border text-nowrap">Periodo de pago</th>
                    <th className="p-2 border text-nowrap">Importe Total de pago (MXN)</th>
                  </tr>
                </thead>
                <tbody>
                  {selecciones.map((s, index) => (
                    <tr key={index} className="text-center">
                      <td className="border p-2 text-nowrap">{s.plantelNombre}</td>
                      <td className="border p-2 text-nowrap">{s.ofertaNombre}</td>
                      <td className="border p-2 text-nowrap">{s.asignaturaNombre}</td>
                      <td className="border p-2 text-nowrap">{s.periodoNombre}</td>
                      <td className="border p-2 text-nowrap">{s.importe_total_pago.toFixed(2)}</td>
                    </tr>
                  ))}
                  {selecciones.length === 0 && (
                    <tr>
                      <td className="border p-2 text-center" colSpan={5}>No hay relaciones agregadas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-2 flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancelar}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              aria-label="Cancelar registro"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              aria-label="Guardar docente"
            >
              Guardar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistroDocente;
