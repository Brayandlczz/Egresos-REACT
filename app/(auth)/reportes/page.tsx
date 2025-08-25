"use client";

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generarReportePagosPDF } from "./components/generate-periods";
import { generarReportePlanteles } from "./components/generate-plantels";
import { generarReporteDocentes } from "./components/generate-teachers";
import { generarReporteDocentesExcel } from "./components-xlsx/generate-teachers";
import { generarReportePagosExcel } from "./components-xlsx/generate-periods";
import { generarReportePlantelesExcel } from "./components-xlsx/generate-plantels";

const supabase = createClientComponentClient();

const ReportFilters: React.FC = () => {
  const [planteles, setPlanteles] = useState<{ id: string; nombre_plantel: string }[]>([]);
  const [docentes, setDocentes] = useState<{ id: string; nombre_docente: string }[]>([]);
  const [periodosPago, setPeriodosPago] = useState<{ id: string; concatenado: string }[]>([]);
  const [filtroPlantelDocente, setFiltroPlantelDocente] = useState("");
  const [filtroDocente, setFiltroDocente] = useState("");
  const [filtroPlantelPlantel, setFiltroPlantelPlantel] = useState("");
  const [filtroPlantelPeriodo, setFiltroPlantelPeriodo] = useState("");
  const [filtroPeriodoPago, setFiltroPeriodoPago] = useState("");

  useEffect(() => {
    async function fetchPlanteles() {
      const { data } = await supabase.from("plantel").select("id,nombre_plantel");
      if (data) setPlanteles(data);
    }
    fetchPlanteles();
  }, []);

  useEffect(() => {
    async function fetchDocentes() {
      if (!filtroPlantelDocente) return setDocentes([]);
      const { data, error } = await supabase
        .from("docente_relations")
        .select("docente(id, nombre_docente)")
        .eq("plantel_id", filtroPlantelDocente);

      if (!error && data) {
        const docentesMap = new Map();
        data.forEach((r) => {
          const docente = Array.isArray(r.docente) ? r.docente[0] : r.docente;
          if (docente && !docentesMap.has(docente.id)) {
            docentesMap.set(docente.id, docente);
          }
        });
        setDocentes(Array.from(docentesMap.values()));
      }
    }
    fetchDocentes();
  }, [filtroPlantelDocente]);

  useEffect(() => {
    async function fetchPeriodosPorPlantel() {
      if (!filtroPlantelPeriodo) return setPeriodosPago([]);
      const { data, error } = await supabase
        .from("periodo_pago")
        .select("id,concatenado")
        .eq("plantel_id", filtroPlantelPeriodo);
      if (!error && data) setPeriodosPago(data);
    }
    fetchPeriodosPorPlantel();
  }, [filtroPlantelPeriodo]);

  async function ejecutarConValidacion(
    condicion: boolean,
    mensaje: string,
    accion: () => Promise<void>,
    reset?: () => void
  ) {
    if (!condicion) {
      alert(mensaje);
      return;
    }
    try {
      await accion();
      if (reset) reset();
    } catch {
      alert("Ocurrió un error, revisa la consola.");
    }
  }

  return (
    <div className="p-6 bg-white-100 max-h-full">
      <h1 className="text-3xl font-light text-center text-black-800 mb-6">Filtros de reportes</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <CardReporte
          titulo="Reporte por docente"
          color="blue"
          filtros={
            <>
              <Select
                label="Plantel"
                options={planteles.map((p) => ({ value: p.id, label: p.nombre_plantel }))}
                value={filtroPlantelDocente}
                onChange={(val) => {
                  setFiltroPlantelDocente(val);
                  setFiltroDocente("");
                }}
              />
              <Select
                label="Docente"
                options={docentes.map((d) => ({ value: d.id, label: d.nombre_docente }))}
                value={filtroDocente}
                onChange={setFiltroDocente}
                disabled={!filtroPlantelDocente}
              />
            </>
          }
          botones={
            <>
              <BotonReporte
                tipo="pdf"
                onClick={() => ejecutarConValidacion(
                  !!filtroPlantelDocente && !!filtroDocente,
                  "Selecciona un plantel y un docente para generar el PDF.",
                  () => generarReporteDocentes(filtroDocente, filtroPlantelDocente),
                  () => {
                    setFiltroDocente("");
                    setFiltroPlantelDocente("");
                  }
                )}
              />
              <BotonReporte
                tipo="excel"
                onClick={() => ejecutarConValidacion(
                  !!filtroPlantelDocente && !!filtroDocente,
                  "Selecciona un plantel y un docente para generar el Excel.",
                  () => generarReporteDocentesExcel(filtroDocente, filtroPlantelDocente),
                  () => {
                    setFiltroDocente("");
                    setFiltroPlantelDocente("");
                  }
                )}
              />
            </>
          }
        />

        <CardReporte
          titulo="Reporte por plantel"
          color="blue"
          filtros={
            <Select
              label="Plantel"
              options={planteles.map((p) => ({ value: p.id, label: p.nombre_plantel }))}
              value={filtroPlantelPlantel}
              onChange={setFiltroPlantelPlantel}
            />
          }
          botones={
            <>
              <BotonReporte
                tipo="pdf"
                onClick={() => ejecutarConValidacion(
                  !!filtroPlantelPlantel,
                  "Selecciona un plantel para generar el PDF.",
                  () => generarReportePlanteles(filtroPlantelPlantel),
                  () => setFiltroPlantelPlantel("")
                )}
              />
              <BotonReporte
                tipo="excel"
                onClick={() => ejecutarConValidacion(
                  !!filtroPlantelPlantel,
                  "Selecciona un plantel para generar el Excel.",
                  () => generarReportePlantelesExcel(filtroPlantelPlantel),
                  () => setFiltroPlantelPlantel("")
                )}
              />
            </>
          }
        />

        <CardReporte
          titulo="Reporte por periodo de pago"
          color="blue"
          filtros={
            <>
              <Select
                label="Plantel"
                options={planteles.map((p) => ({ value: p.id, label: p.nombre_plantel }))}
                value={filtroPlantelPeriodo}
                onChange={(val) => {
                  setFiltroPlantelPeriodo(val);
                  setFiltroPeriodoPago("");
                }}
              />
              <Select
                label="Periodo de pago"
                options={periodosPago.map((p) => ({ value: p.id, label: p.concatenado }))}
                value={filtroPeriodoPago}
                onChange={setFiltroPeriodoPago}
                disabled={!filtroPlantelPeriodo}
              />
            </>
          }
          botones={
            <>
              <BotonReporte
                tipo="pdf"
                onClick={() => ejecutarConValidacion(
                  !!filtroPeriodoPago,
                  "Selecciona un periodo de pago para generar el PDF.",
                  () => generarReportePagosPDF(filtroPeriodoPago),
                  () => {
                    setFiltroPeriodoPago("");
                    setFiltroPlantelPeriodo("");
                  }
                )}
              />
              <BotonReporte
                tipo="excel"
                onClick={() => ejecutarConValidacion(
                  !!filtroPeriodoPago,
                  "Selecciona un periodo de pago para generar el Excel.",
                  () => generarReportePagosExcel(filtroPeriodoPago),
                  () => {
                    setFiltroPeriodoPago("");
                    setFiltroPlantelPeriodo("");
                  }
                )}
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
    <h2 className={`text-xl font-bold mb-4 ${colores[color]} text-white p-2 rounded text-center`}>
      {titulo}
    </h2>
    <div className="mb-4 flex-grow">{filtros}</div>
    {botones && (
      <div className="mt-auto flex flex-row justify-center gap-2 flex-nowrap">
        {botones}
      </div>
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill={isPDF ? "red" : "green"}
        viewBox="0 0 24 24"
      >
        <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM14 3.5V9h5.5L14 3.5z" />
        <text x="7" y="18" fontWeight="bold" fontSize="7" fill="white">
          {isPDF ? "PDF" : "XLS"}
        </text>
      </svg>
      Generar {isPDF ? "PDF" : "Excel"}
    </button>
  );
};