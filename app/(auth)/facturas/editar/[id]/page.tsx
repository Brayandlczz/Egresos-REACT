'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const EdicionFactura: React.FC = () => {
  const supabase = createClientComponentClient();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined);
  const router = useRouter();

  const [folio, setFolio] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [mesPago, setMesPago] = useState('');
  const [importePago, setImportePago] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [plantelId, setPlantelId] = useState('');
  const [docenteId, setDocenteId] = useState('');
  const [bancoId, setBancoId] = useState('');
  const [conceptoId, setConceptoId] = useState('');
  const [relacionId, setRelacionId] = useState('');

  const [facturaFile, setFacturaFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [comprobantePagoFile, setComprobantePagoFile] = useState<File | null>(null);

  const [planteles, setPlanteles] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [bancos, setBancos] = useState<any[]>([]);
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [relaciones, setRelaciones] = useState<any[]>([]);
  const [archivosExistentes, setArchivosExistentes] = useState<any[]>([]);

  useEffect(() => {
    const cargarIniciales = async () => {
      const { data } = await supabase.from('plantel').select('id, nombre_plantel');
      setPlanteles(data || []);
    };
    cargarIniciales();
  }, [supabase]);

  useEffect(() => {
    const cargarFactura = async () => {
      if (!id) return;
      const { data, error } = await supabase.from('factura').select('*').eq('id', id).single();
      if (!error && data) {
        setFolio(data.folio || '');
        setFechaPago(data.fecha_pago || '');
        setMesPago(data.mes_pago || '');
        setImportePago(data.importe?.toString() || '');
        setFormaPago(data.forma_pago || '');
        setPlantelId(data.plantel_id || '');
        setDocenteId(data.docente_id || '');
        setBancoId(data.cuenta_banco_id || '');
        setConceptoId(data.concepto_pago_id || '');
        setRelacionId(data.docente_relation_id || '');
      }

      const { data: archivos } = await supabase
        .from('facturas_archivos')
        .select('*')
        .eq('factura_id', id);
      setArchivosExistentes(archivos || []);
    };

    cargarFactura();
  }, [id, supabase]);

  useEffect(() => {
    if (!plantelId) return setDocentes([]);
    supabase
      .from('docente_relations')
      .select(`id, docente_id, docente:docente_id (nombre_docente)`)
      .eq('plantel_id', plantelId)
      .then(({ data }) => setDocentes(data || []));
  }, [plantelId, supabase]);

  useEffect(() => {
    if (!plantelId || !docenteId) return setRelaciones([]);
    supabase
      .from('docente_relations')
      .select(`id, asignatura_id, asignatura:asignatura_id (nombre_asignatura), oferta_educativa_id, oferta_educativa:oferta_educativa_id (nombre_oferta), periodo_pago_id, periodo_pago:periodo_pago_id (concatenado)`)
      .eq('plantel_id', plantelId)
      .eq('docente_id', docenteId)
      .then(({ data }) => setRelaciones(data || []));
  }, [plantelId, docenteId, supabase]);

  useEffect(() => {
    if (!plantelId) return setConceptos([]);
    supabase
      .from('concepto_pago')
      .select('*')
      .eq('plantel_id', plantelId)
      .then(({ data }) => setConceptos(data || []));
  }, [plantelId, supabase]);

  useEffect(() => {
    if (!plantelId) return setBancos([]);
    supabase
      .from('cuenta_banco')
      .select('*')
      .eq('plantel_id', plantelId)
      .then(({ data }) => setBancos(data || []));
  }, [plantelId, supabase]);

  useEffect(() => {
    if (formaPago !== 'TRANSFERENCIA') {
      setBancoId('');
    }
  }, [formaPago]);

  const handleActualizar = async () => {
    if (!folio || !fechaPago || !mesPago || !importePago || !formaPago || !plantelId || !docenteId || !conceptoId || !relacionId) {
      alert('Complete todos los campos obligatorios.');
      return;
    }

    const { error: updateError } = await supabase
      .from('factura')
      .update({
        folio,
        fecha_pago: fechaPago,
        mes_pago: mesPago,
        importe: parseFloat(importePago),
        forma_pago: formaPago,
        plantel_id: plantelId,
        docente_id: docenteId,
        cuenta_banco_id: bancoId || null,
        concepto_pago_id: conceptoId,
        docente_relation_id: relacionId,
      })
      .eq('id', id);

    if (updateError) {
      alert('Error al actualizar: ' + updateError.message);
      return;
    }

    const nuevosArchivos = [
      { file: xmlFile, tipo: 'XML', ext: 'xml' },
      { file: facturaFile, tipo: 'Factura', ext: 'pdf' },
      { file: comprobantePagoFile, tipo: 'Comprobante', ext: 'pdf' },
    ];

    for (const archivo of nuevosArchivos) {
      if (!archivo.file) continue;
      const nombreUnico = `${folio}_${archivo.tipo}.${archivo.ext}`;
      const ruta = `${archivo.tipo}/${nombreUnico}`;

      const existente = archivosExistentes.find(a => a.nombre_unico === nombreUnico);
      if (existente) {
        await supabase.storage.from('facturas').remove([existente.path]);
        await supabase.from('facturas_archivos').delete().eq('id', existente.id);
      }

      const { error: uploadError } = await supabase.storage
        .from('facturas')
        .upload(ruta, archivo.file, { upsert: true });

      if (uploadError) {
        alert(`Error subiendo ${archivo.tipo}: ${uploadError.message}`);
        return;
      }

      await supabase.from('facturas_archivos').insert({
        factura_id: id,
        path: ruta,
        nombre_original: archivo.file.name,
        nombre_unico: nombreUnico,
      });
    }

    alert('Factura actualizada correctamente.');
    router.push('/facturas');
  };

  const docentesUnicos = Array.from(
    new Map(docentes.map((d) => [d.docente_id, d])).values()
  );

  return (
    <div className="relative p-8 bg-white-100 max-h-screen">
      <h2 className="text-2xl font-semibold mb-6">
        <span className="font-bold text-black">Facturas</span> | Edición de Factura N°{folio}
      </h2>
      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Editar factura
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-medium mb-2">Folio:</label>
              <input type="text" value={folio} onChange={(e) => setFolio(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-2">Plantel:</label>
              <select value={plantelId} onChange={(e) => setPlantelId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione plantel</option>
                {planteles.map(p => <option key={p.id} value={p.id}>{p.nombre_plantel}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">Docente:</label>
              <select value={docenteId} onChange={(e) => setDocenteId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione docente</option>
                {docentesUnicos.map(d => <option key={d.docente_id} value={d.docente_id}>{d.docente?.nombre_docente}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2.5">Relación:</label>
              <select value={relacionId} onChange={(e) => setRelacionId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione relación</option>
                {relaciones.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.asignatura?.nombre_asignatura} | {r.oferta_educativa?.nombre_oferta} | {r.periodo_pago?.concatenado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">Fecha de pago:</label>
              <input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-2">Mes de pago:</label>
              <input type="month" value={mesPago} onChange={(e) => setMesPago(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-2">Importe de pago:</label>
              <input type="number" value={importePago} onChange={(e) => setImportePago(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-2">Forma de pago:</label>
              <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione forma</option>
                <option value="ABONO A COLEGIATURA">ABONO A COLEGIATURA</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>
            {formaPago === 'TRANSFERENCIA' && (
              <div>
                <label className="block font-medium mb-2">Banco:</label>
                <select value={bancoId} onChange={(e) => setBancoId(e.target.value)} className="w-full border p-2 rounded">
                  <option value="">Seleccione banco</option>
                  {bancos.map(opt => <option key={opt.id} value={opt.id}>{opt.banco}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block font-medium mb-2">Concepto de pago:</label>
              <select value={conceptoId} onChange={(e) => setConceptoId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione concepto</option>
                {conceptos.map(opt => <option key={opt.id} value={opt.id}>{opt.descripcion}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div>
              <label className="block font-medium mb-2">Factura (PDF):</label>
              <input type="file" accept=".pdf" onChange={(e) => setFacturaFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-2">Archivo XML:</label>
              <input type="file" accept=".xml" onChange={(e) => setXmlFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block font-medium mb-2">Comprobante de pago:</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setComprobantePagoFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6">
            <button onClick={() => router.back()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cancelar</button>
            <button onClick={handleActualizar} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Actualizar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdicionFactura;
