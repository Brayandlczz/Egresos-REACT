"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generarReporteProveedoresPDF } from "./components/generate-plantel";
import { generarReporteFacturasPorProveedorPDF } from "./components/generate-proveedor";
import { generarReporteFacturasPorEtiquetaPDF } from "./components/generate-clasificacion";

const supabase = createClientComponentClient();

const ReportFilters: React.FC = () => {
  const [planteles, setPlanteles] = useState<{ id: string; nombre_plantel: string }[]>([]);
  const [proveedores, setProveedores] = useState<{ id: string; nombre_proveedor: string }[]>([]);
  const [etiquetas, setEtiquetas] = useState<{ id: string; nombre_etiqueta: string }[]>([]);

  const [filtroPlantelReportePlantel, setFiltroPlantelReportePlantel] = useState("");
  const [filtroPlantelReporteProveedor, setFiltroPlantelReporteProveedor] = useState("");
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroPlantelReporteClasificacion, setFiltroPlantelReporteClasificacion] = useState("");
  const [filtroEtiqueta, setFiltroEtiqueta] = useState("");

  useEffect(() => {
    async function fetchPlanteles() {
      const { data } = await supabase.from("plantel").select("id,nombre_plantel");
      if (data) setPlanteles(data);
    }
    fetchPlanteles();
  }, []);

  useEffect(() => {
    async function fetchEtiquetas() {
      if (!filtroPlantelReporteClasificacion) {
        setEtiquetas([]);
        setFiltroEtiqueta("");
        return;
      }
      const { data, error } = await supabase
        .from("etiquetas")
        .select("id,nombre_etiqueta")
        .eq("plantel_id", filtroPlantelReporteClasificacion);

      if (!error && data) setEtiquetas(data);
    }
    fetchEtiquetas();
  }, [filtroPlantelReporteClasificacion]);

  useEffect(() => {
    async function fetchProveedores() {
      if (!filtroPlantelReporteProveedor) {
        setProveedores([]);
        setFiltroProveedor("");
        return;
      }
      const { data, error } = await supabase
        .from("proveedores")
        .select("id, nombre_proveedor")
        .eq("plantel_id", filtroPlantelReporteProveedor);

      if (!error && data) {
        setProveedores(data);
      }
    }
    fetchProveedores();
  }, [filtroPlantelReporteProveedor]);

  async function ejecutarConValidacion(
    condicion: boolean,
    mensaje: string,
    accion: () => Promise<void>,
    limpiarFiltros?: () => void
  ) {
    if (!condicion) {
      alert(mensaje);
      return;
    }
    try {
      await accion();
      if (limpiarFiltros) limpiarFiltros();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error, revisa la consola.");
    }
  }

  async function generarReportePlantelesExcel(plantelId: string) {
    if (!plantelId) {
      alert("Selecciona un plantel válido para el Excel.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("factura")
        .select(`
          folio,
          fecha_pago,
          importe,
          forma_pago,
          docente(nombre_docente),
          docente_relation:docente_relation_id (
            plantel(nombre_plantel),
            asignatura(nombre_asignatura),
            periodo_pago(concatenado)
          )
        `)
        .eq("plantel_id", plantelId);

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("No hay facturas para el plantel seleccionado.");
        return;
      }

      const normalized = (data || []).map((row: any) => {
        const rel = Array.isArray(row.docente_relation) ? row.docente_relation[0] ?? {} : row.docente_relation ?? {};
        const plantelObj = rel.plantel ? (Array.isArray(rel.plantel) ? rel.plantel[0] ?? {} : rel.plantel) : {};
        const asignaturaObj = rel.asignatura ? (Array.isArray(rel.asignatura) ? rel.asignatura[0] ?? {} : rel.asignatura) : {};
        const periodoObj = rel.periodo_pago ? (Array.isArray(rel.periodo_pago) ? rel.periodo_pago[0] ?? {} : rel.periodo_pago) : {};

        return {
          folio: row.folio ?? "N/A",
          fecha_pago: row.fecha_pago ?? "",
          importe: Number(row.importe ?? 0),
          forma_pago: row.forma_pago ?? "N/A",
          docente_nombre: row.docente?.nombre_docente ?? "N/A",
          plantel_nombre: plantelObj?.nombre_plantel ?? "N/A",
          asignatura_nombre: asignaturaObj?.nombre_asignatura ?? "N/A",
          periodo_concatenado: periodoObj?.concatenado ?? "N/A",
        };
      });

      const headers = [
        "Folio",
        "Fecha pago",
        "Importe",
        "Forma pago",
        "Plantel",
        "Docente",
        "Asignatura",
        "Periodo",
      ];
      const rows = normalized.map((r) => [
        csvSafe(r.folio),
        csvSafe(r.fecha_pago ? new Date(r.fecha_pago).toLocaleDateString("es-MX") : ""),
        csvSafe(r.importe.toFixed(2)),
        csvSafe(r.forma_pago),
        csvSafe(r.plantel_nombre),
        csvSafe(r.docente_nombre),
        csvSafe(r.asignatura_nombre),
        csvSafe(r.periodo_concatenado),
      ]);

      const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `reporte_plantel_${plantelId}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.setAttribute("download", filename);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      function csvSafe(value: any) {
        if (value === null || value === undefined) return "";
        const s = String(value);
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      }
    } catch (err) {
      console.error(err);
      alert("Error generando Excel (CSV). Revisa la consola.");
    }
  }

  return (
    <div className="p-6 bg-white-100 max-h-full">
      <h1 className="text-3xl font-light text-center text-black-800 mb-6">
        Filtros de reporte de proveedores
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        <CardReporte
          titulo="Reporte por plantel"
          color="blue"
          filtros={
            <Select
              label="Plantel"
              options={planteles.map((p) => ({ value: p.id, label: p.nombre_plantel }))}
              value={filtroPlantelReportePlantel}
              onChange={setFiltroPlantelReportePlantel}
            />
          }
          botones={
            <>
              <BotonReporte
                tipo="pdf"
                onClick={() =>
                  ejecutarConValidacion(
                    !!filtroPlantelReportePlantel,
                    "Selecciona un plantel para generar el PDF.",
                    () => generarReporteProveedoresPDF(filtroPlantelReportePlantel),
                    () => setFiltroPlantelReportePlantel("")
                  )
                }
              />
              <BotonReporte
                tipo="excel"
                onClick={() =>
                  ejecutarConValidacion(
                    !!filtroPlantelReportePlantel,
                    "Selecciona un plantel para generar el Excel.",
                    () => generarReportePlantelesExcel(filtroPlantelReportePlantel),
                    () => setFiltroPlantelReportePlantel("")
                  )
                }
              />
            </>
          }
        />

        <CardReporte
          titulo="Reporte por proveedor"
          color="blue"
          filtros={
            <>
              <Select
                label="Plantel"
                options={planteles.map((p) => ({ value: p.id, label: p.nombre_plantel }))}
                value={filtroPlantelReporteProveedor}
                onChange={(val) => {
                  setFiltroPlantelReporteProveedor(val);
                  setFiltroProveedor("");
                }}
              />
              <Select
                label="Proveedor"
                options={proveedores.map((p) => ({ value: p.id, label: p.nombre_proveedor }))}
                value={filtroProveedor}
                onChange={setFiltroProveedor}
                disabled={!filtroPlantelReporteProveedor}
              />
            </>
          }
          botones={
            <>
              <BotonReporte
                tipo="pdf"
                onClick={() =>
                  ejecutarConValidacion(
                    !!filtroPlantelReporteProveedor && !!filtroProveedor,
                    "Selecciona un plantel y un proveedor para generar el PDF.",
                    () => generarReporteFacturasPorProveedorPDF(filtroProveedor),
                    () => {
                      setFiltroPlantelReporteProveedor("");
                      setFiltroProveedor("");
                    }
                  )
                }
              />
            </>
          }
        />

        <CardReporte
          titulo="Reporte por tipo de gasto"
          color="blue"
          filtros={
            <>
              <Select
                label="Plantel"
                options={planteles.map((p) => ({ value: p.id, label: p.nombre_plantel }))}
                value={filtroPlantelReporteClasificacion}
                onChange={setFiltroPlantelReporteClasificacion}
              />
              <Select
                label="Etiqueta"
                options={etiquetas.map((e) => ({ value: e.id, label: e.nombre_etiqueta }))}
                value={filtroEtiqueta}
                onChange={setFiltroEtiqueta}
              />
            </>
          }
          botones={
            <>
              <BotonReporte
                tipo="pdf"
                onClick={() =>
                  ejecutarConValidacion(
                    !!filtroPlantelReporteClasificacion && !!filtroEtiqueta,
                    "Selecciona un plantel y una etiqueta para generar el reporte por tipo de gasto.",
                    () =>
                      generarReporteFacturasPorEtiquetaPDF(
                        filtroPlantelReporteClasificacion,
                        filtroEtiqueta
                      ),
                    () => {
                      setFiltroPlantelReporteClasificacion("");
                      setFiltroEtiqueta("");
                    }
                  )
                }
              />
            </>
          }
        />
      </div>
    </div>
  );
};

export default ReportFilters;

const colores = {
  blue: "bg-blue-500",
  yellow: "bg-yellow-500",
};

const CardReporte: React.FC<{
  titulo: string;
  color: keyof typeof colores;
  filtros: React.ReactNode;
  botones?: React.ReactNode;
}> = ({ titulo, color, filtros, botones }) => (
  <div className="bg-white rounded shadow p-4 flex flex-col">
    <h2 className={`text-xl font-bold mb-4 ${colores[color]} text-white p-2 rounded text-center`}>{titulo}</h2>
    <div className="mb-4 flex-grow">{filtros}</div>
    {botones && (
      <div className="mt-auto flex flex-row justify-center gap-2 flex-nowrap">{botones}</div>
    )}
  </div>
);

const Select: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ label, options, value, onChange, disabled }) => (
  <div className="mb-3">
    <label className="block mb-1 font-semibold">{label}</label>
    <select
      disabled={disabled}
      className={`w-full border border-gray-300 rounded px-2 py-1 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Seleccione una opción</option>
      {options.map(({ value: val, label: lab }) => (
        <option key={val} value={val}>
          {lab}
        </option>
      ))}
    </select>
  </div>
);

const BotonReporte: React.FC<{ tipo: "pdf" | "excel"; onClick: () => void }> = ({ tipo, onClick }) => {
  const isPDF = tipo === "pdf";
  return (
    <button
      onClick={onClick}
      className={`${isPDF ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white px-3 py-2.5 rounded flex items-center gap-2`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={isPDF ? "red" : "green"} viewBox="0 0 24 24">
        <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM14 3.5V9h5.5L14 3.5z" />
        <text x="7" y="18" fontWeight="bold" fontSize="7" fill="white">
          {isPDF ? "PDF" : "XLS"}
        </text>
      </svg>
      Generar {isPDF ? "PDF" : "Excel"}
    </button>
  );
};
