"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ThreeDot } from "react-loading-indicators";

const RegistroFacturaProveedor: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [planteles, setPlanteles] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [etiquetas, setEtiquetas] = useState<any[]>([]);

  const [folioFiscal, setFolioFiscal] = useState('');
  const [plantelId, setPlantelId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [etiquetaId, setEtiquetaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const [gasto, setGasto] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const cargarPlanteles = async () => {
      const { data } = await supabase
        .from('plantel')
        .select('id, nombre_plantel')
        .order('nombre_plantel');

      if (data) setPlanteles(data);
    };

    cargarPlanteles();
  }, []);

  useEffect(() => {
    const cargarRelacionados = async () => {
      if (!plantelId) {
        setProveedores([]);
        setEtiquetas([]);
        setDepartamentos([]);
        setProveedorId('');
        setEtiquetaId('');
        setDepartamentoId('');
        return;
      }

      const [{ data: proveedores }, { data: etiquetas }, { data: departamentos }] = await Promise.all([
        supabase.from('proveedores').select('id, nombre_proveedor').eq('plantel_id', plantelId).order('nombre_proveedor'),
        supabase.from('etiquetas').select('id, nombre_etiqueta').eq('plantel_id', plantelId).order('nombre_etiqueta'),
        supabase.from('departamentos').select('id, nombre_departamento').eq('plantel_id', plantelId).order('nombre_departamento'),
      ]);

      if (proveedores) setProveedores(proveedores);
      if (etiquetas) setEtiquetas(etiquetas);
      if (departamentos) setDepartamentos(departamentos);
    };

    cargarRelacionados();
  }, [plantelId]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");

        const comprobante = xml.getElementsByTagName("cfdi:Comprobante")[0];
        const tfd = xml.getElementsByTagName("tfd:TimbreFiscalDigital")[0];
        const conceptos = xml.getElementsByTagName("cfdi:Concepto");

        const folio = comprobante?.getAttribute("Folio") || "";
        const fecha = comprobante?.getAttribute("Fecha")?.substring(0, 10) || "";
        const total = comprobante?.getAttribute("Total") || "";
        const uuid = tfd?.getAttribute("UUID") || "";

        let descripcion = "";
        for (let i = 0; i < conceptos.length; i++) {
          const desc = conceptos[i].getAttribute("Descripcion");
          if (desc) {
            descripcion += `• ${desc}\n`;
          }
        }

        setFolioFiscal(uuid || folio);
        setFecha(fecha);
        setGasto(total);
        setObservacion(descripcion.trim());
      }
    };
    reader.readAsText(file);
  };

  const handleGuardar = async () => {
    if (
      !folioFiscal.trim() ||
      !proveedorId ||
      !fecha ||
      !etiquetaId ||
      !observacion.trim() ||
      !gasto ||
      !departamentoId ||
      !plantelId
    ) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setSuccessMessage('');

    const { error } = await supabase.from('factura_proveedores').insert([{
      proveedor_id: proveedorId,
      fecha,
      etiqueta: etiquetaId,
      observación: observacion,
      gasto: parseFloat(gasto),
      departamento: departamentoId,
      plantel_id: plantelId,
      folio_fiscal: folioFiscal.trim(),
    }]);

    setTimeout(() => setLoading(false), 1000);

    if (error) {
      console.error("Error guardando la factura:", error);
      alert("Error guardando la factura: " + JSON.stringify(error));
    } else {
      setSuccessMessage("¡Factura registrada con éxito!");
      setFolioFiscal('');
      setProveedorId('');
      setFecha('');
      setEtiquetaId('');
      setObservacion('');
      setGasto('');
      setDepartamentoId('');
      setPlantelId('');
      setTimeout(() => {
        router.push("/egresos");
      }, 2000);
    }
  };

  const handleCancelar = () => {
    router.push("/egresos");
  };

  return (
    <div className="relative p-8 bg-white-100 max-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <ThreeDot color="#2464ec" size="large" />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded shadow">
          {successMessage}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">
        <span className="font-bold text-black">Facturas</span> | Registro de factura de proveedor
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Datos de la factura
        </div>

        <div className="p-4 space-y-4">

          <div>
            <label className="block mb-1 font-medium">Cargar XML de factura:</label>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              className="w-full p-2 border rounded bg-white"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Folio Fiscal:</label>
            <input
              type="text"
              value={folioFiscal}
              onChange={(e) => setFolioFiscal(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ingresa el folio fiscal"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-medium">Plantel:</label>
              <select value={plantelId} onChange={(e) => setPlantelId(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Seleccione un plantel</option>
                {planteles.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre_plantel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Proveedor:</label>
              <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="w-full p-2 border rounded" disabled={!plantelId}>
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre_proveedor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Fecha:</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Clasificación:</label>
              <select value={etiquetaId} onChange={(e) => setEtiquetaId(e.target.value)} className="w-full p-2 border rounded" disabled={!plantelId}>
                <option value="">Seleccione una clasificación</option>
                {etiquetas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre_etiqueta}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Departamento:</label>
              <select value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)} className="w-full p-2 border rounded" disabled={!plantelId}>
                <option value="">Seleccione un departamento</option>
                {departamentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombre_departamento}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Descripción:</label>
            <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)} className="w-full p-2 border rounded" rows={3} />
          </div>

          <div>
            <label className="block mb-1 font-medium">Importe:</label>
            <input type="number" min="0" step="0.01" value={gasto} onChange={(e) => setGasto(e.target.value)} className="w-full p-2 border rounded" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={handleCancelar} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" disabled={loading}>
              Cancelar
            </button>
            <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroFacturaProveedor;
