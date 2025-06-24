'use client'

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

  const RegistroFactura: React.FC = () => {
  const supabase = createClientComponentClient();

  const [folio, setFolio] = useState('');
  const [fechaPago, setFechaPago] = useState('');
  const [mesPago, setMesPago] = useState('');
  const [importePago, setImportePago] = useState('');
  const [formaPago, setFormaPago] = useState('');
  const [planteles, setPlanteles] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [bancos, setBancos] = useState<any[]>([]);
  const [conceptos, setConceptos] = useState<any[]>([]);
  const [relaciones, setRelaciones] = useState<any[]>([]); 
  const [relacionId, setRelacionId] = useState<string>(''); 
  const [plantelId, setPlantelId] = useState('');
  const [docenteId, setDocenteId] = useState('');
  const [bancoId, setBancoId] = useState('');
  const [conceptoId, setConceptoId] = useState('');
  const [facturaFile, setFacturaFile] = useState<File | null>(null);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [comprobantePagoFile, setComprobantePagoFile] = useState<File | null>(null);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const [plantelesRes] = await Promise.all([
        supabase.from('plantel').select('id, nombre_plantel'),
      ]);
      if (!plantelesRes.error) setPlanteles(plantelesRes.data || []);
    };
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (!plantelId) return setDocentes([]);
    supabase
      .from('docente_relations')
      .select(`
        id,
        docente_id,
        docente:docente_id (nombre_docente)
      `)
      .eq('plantel_id', plantelId)

      .then(({ data, error }) => {
        if (!error && data) setDocentes(data);
      });
    setDocenteId('');
  }, [plantelId]);

  useEffect(() => {
    if (!plantelId) {
      setBancos([]);
      setBancoId('');
      return;
    }
    supabase
      .from('cuenta_banco')
      .select('id, banco')
      .eq('plantel_id', plantelId)
      .then(({ data, error }) => {
        if (!error && data) setBancos(data);
      });
    setBancoId('');
  }, [plantelId]);

  useEffect(() => {
    if (!plantelId) {
      setConceptos([]);
      setConceptoId('');
      return;
    }
    supabase
      .from('concepto_pago')
      .select('id, descripcion')
      .eq('plantel_id', plantelId)
      .then(({ data, error }) => {
        if (!error && data) setConceptos(data);
      });
    setConceptoId('');
  }, [plantelId]);

useEffect(() => {
  if (!plantelId || !docenteId) {
    setRelaciones([]);
    setRelacionId('');
    return;
  }

  const fetchRelaciones = async () => {
    const { data, error } = await supabase
      .from('docente_relations')
      .select(`
        id,
        asignatura_id,
        asignatura:asignatura_id (nombre_asignatura),
        oferta_educativa_id,
        oferta_educativa:oferta_educativa_id (nombre_oferta),
        periodo_pago_id,
        periodo_pago:periodo_pago_id (concatenado)
      `)
      .eq('plantel_id', plantelId)
      .eq('docente_id', docenteId); 

    if (error) {
      console.error('Error al obtener relaciones del docente:', error);
    } else if (!data || data.length === 0) {
      alert('No se encontraron relaciones para el docente en este plantel.');
      setRelaciones([]);
      setRelacionId('');
    } else {
      setRelaciones(data);
      setRelacionId('');
    }
  };

  fetchRelaciones();
}, [plantelId, docenteId]); 

  const handleGuardar = async () => {
    if (
      !folio || !fechaPago || !mesPago || !importePago || !formaPago || !plantelId || !docenteId || !bancoId || !conceptoId || !relacionId ||!facturaFile || !xmlFile || !comprobantePagoFile
    ) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    try {
      const { data: facturaData, error: facturaError } = await supabase
        .from('factura')
        .insert([{
          folio,
          fecha_pago: fechaPago,
          mes_pago: mesPago,
          importe: parseFloat(importePago),
          forma_pago: formaPago,
          plantel_id: plantelId,
          docente_id: docenteId,
          cuenta_banco_id: bancoId,
          concepto_pago_id: conceptoId,
          docente_relation_id: relacionId,
        }])
        .select('id')
        .single();

      if (facturaError) {
        console.error('Error al registrar la factura:', facturaError);
        alert('Error al registrar la factura: ' + facturaError.message);
        return;
      }

      const facturaId = facturaData.id;

      const archivos = [
        { file: xmlFile, tipo: 'XML', extension: 'xml' },
        { file: facturaFile, tipo: 'Factura', extension: 'pdf' },
        { file: comprobantePagoFile, tipo: 'Comprobante', extension: 'pdf' }
      ];

      for (const archivo of archivos) {
        if (!archivo.file) continue;

        const nombreOriginal = archivo.file.name;
        const nombreUnico = `${folio}_${archivo.tipo}.${archivo.extension}`;
        const ruta = `${archivo.tipo}/${nombreUnico}`;

        const { data: existeArchivo } = await supabase
          .storage
          .from('facturas')
          .list(archivo.tipo, { search: nombreUnico });

        const yaExiste = existeArchivo?.some(f => f.name === nombreUnico);

        if (!yaExiste) {
          const { error: uploadError } = await supabase.storage
            .from('facturas')
            .upload(ruta, archivo.file, { upsert: true });

          if (uploadError) {
            console.error(`Error al subir archivo ${archivo.tipo}:`, uploadError.message);
            alert(`Error al subir archivo ${archivo.tipo}: ` + uploadError.message);
            return;
          }
        }

        const { error: insertArchivoError } = await supabase
          .from('facturas_archivos')
          .insert([{
            factura_id: facturaId,
            path: ruta,
            nombre_original: nombreOriginal,
            nombre_unico: nombreUnico,
          }]);

        if (insertArchivoError) {
          console.error(`Error al registrar archivo ${archivo.tipo}:`, insertArchivoError.message);
          alert(`Error al registrar archivo ${archivo.tipo}: ` + insertArchivoError.message);
          return;
        }
      }

      alert('Factura registrada con éxito.');
      handleCancelar();

    } catch (e: any) {
      console.error('Error inesperado:', e.message);
      alert('Error inesperado: ' + e.message);
    }
  };

  const handleCancelar = () => {
    setFolio('');
    setFechaPago('');
    setMesPago('');
    setImportePago('');
    setFormaPago('');
    setPlantelId('');
    setDocenteId('');
    setBancoId('');
    setConceptoId('');
    setRelacionId('');
    setFacturaFile(null);
    setXmlFile(null);
    setComprobantePagoFile(null);
  };

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Facturas | Registro de Facturas
      </h2>
      <div className="max-w-9xl mx-auto bg-white border rounded-xl shadow-sm">
        <div className="bg-blue-600 text-white px-6 py-3 rounded-t-xl text-lg font-semibold">
          Datos de la factura
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Folio:</label>
              <input type="text" value={folio} onChange={(e) => setFolio(e.target.value)} className="w-full border p-2 rounded" placeholder="Ingrese el número de folio" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plantel:</label>
              <select value={plantelId} onChange={(e) => setPlantelId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione una opción</option>
                {planteles.map(opt => <option key={opt.id} value={opt.id}>{opt.nombre_plantel}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Docente:</label>
              <select
                value={docenteId}
                onChange={(e) => setDocenteId(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">Seleccione una opción</option>
                {docentes.map((opt) => (
                  <option key={opt.docente_id} value={opt.docente_id}>
                    {opt.docente?.nombre_docente}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relación:</label>
              <select
                value={relacionId}
                onChange={(e) => setRelacionId(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">Seleccione una opción</option>
                {relaciones.map((rel) => (
                  <option key={rel.id} value={rel.id}>
                    {rel.asignatura?.nombre_asignatura} | {rel.oferta_educativa?.nombre_oferta} | {rel.periodo_pago?.concatenado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago:</label>
              <input type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mes de pago:</label>
              <input type="month" value={mesPago} onChange={(e) => setMesPago(e.target.value)} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Importe de pago:</label>
              <input type="number" value={importePago} onChange={(e) => setImportePago(e.target.value)} className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banco:</label>
              <select value={bancoId} onChange={(e) => setBancoId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione una opción</option>
                {bancos.map(opt => <option key={opt.id} value={opt.id}>{opt.banco}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Concepto de pago:</label>
              <select value={conceptoId} onChange={(e) => setConceptoId(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione una opción</option>
                {conceptos.map(opt => <option key={opt.id} value={opt.id}>{opt.descripcion}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pago:</label>
              <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Seleccione una forma</option>
                <option value="ABONO A COLEGIATURA">ABONO A COLEGIATURA</option>
                <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                <option value="EFECTIVO">EFECTIVO</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factura (PDF):</label>
              <input type="file" accept=".pdf" onChange={(e) => setFacturaFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Archivo XML:</label>
              <input type="file" accept=".xml" onChange={(e) => setXmlFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante de pago (JPG):</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setComprobantePagoFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6">
            <button onClick={handleCancelar} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Cancelar</button>
            <button onClick={handleGuardar} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroFactura;