"use client";

import React, { useState } from "react";

const ReportFilters: React.FC = () => {
  const [filtroPlantelDocente, setFiltroPlantelDocente] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [filtroPlantelPlantel, setFiltroPlantelPlantel] = useState("");
  const [filtroPlantelPeriodo, setFiltroPlantelPeriodo] = useState("");
  const [filtroPeriodoPago, setFiltroPeriodoPago] = useState("");

  const planteles = [
    { id: "1", nombre_plantel: "UNICI TUXTLA" },
    { id: "2", nombre_plantel: "UNICI TAPACHULA" },
  ];
  const docentes = [
    { id: "1", nombre_docente: "Juan Pérez" },
    { id: "2", nombre_docente: "María López" },
  ];
  const periodosPago = [
    { id: "1", concatenado: "Enero - Febrero 2025" },
    { id: "2", concatenado: "Marzo - Abril 2025" },
  ];

  return (
    <div className="max-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Generador de Reportes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecciona los filtros necesarios y genera reportes en PDF o Excel para cada tipo de análisis
          </p>
        </div>

        <div className="text-center grid lg:grid-cols-3 md:grid-cols-2 gap-8">
        <CardReporte
          titulo="Por rango de tiempo"
          color="blue"
          description="Reporte consolidado por rango de fechas específico"
          filtros={
            <>
              <Select
                label="Plantel"
                options={planteles.map((p) => ({
                  value: p.id,
                  label: p.nombre_plantel,
                }))}
                value={filtroPlantelDocente}
                onChange={(val) => {
                  setFiltroPlantelDocente(val);
                  setFechaInicio("");
                  setFechaFin("");
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <DateInput
                  label="Fecha de Inicio"
                  value={fechaInicio}
                  onChange={setFechaInicio}
                  disabled={!filtroPlantelDocente}
                />
                <DateInput
                  label="Fecha de Fin"
                  value={fechaFin}
                  onChange={setFechaFin}
                  disabled={!filtroPlantelDocente}
                />
              </div>
            </>
          }
            botones={
              <>
                <BotonReporte tipo="pdf" onClick={() => alert("Generar PDF")} />
                <BotonReporte tipo="excel" onClick={() => alert("Generar Excel")} />
              </>
            }
          />

          <CardReporte
            titulo="Por área"
            color="indigo"
            description="Reporte consolidados por área y rango de fechas"
            filtros={
              <Select
                label="Plantel"
                options={planteles.map((p) => ({
                  value: p.id,
                  label: p.nombre_plantel,
                }))}
                value={filtroPlantelPlantel}
                onChange={setFiltroPlantelPlantel}
              />
            }
            botones={
              <>
                <BotonReporte tipo="pdf" onClick={() => alert("Generar PDF")} />
                <BotonReporte tipo="excel" onClick={() => alert("Generar Excel")} />
              </>
            }
          />

          <CardReporte
            titulo="Por artículo"
            color="purple"
            description="Reporte de gastos por artículos en un periodo delimitado"
            filtros={
              <>
                <Select
                  label="Plantel"
                  options={planteles.map((p) => ({
                    value: p.id,
                    label: p.nombre_plantel,
                  }))}
                  value={filtroPlantelPeriodo}
                  onChange={(val) => {
                    setFiltroPlantelPeriodo(val);
                    setFiltroPeriodoPago("");
                  }}
                />
                <Select
                  label="Periodo de pago"
                  options={periodosPago.map((p) => ({
                    value: p.id,
                    label: p.concatenado,
                  }))}
                  value={filtroPeriodoPago}
                  onChange={setFiltroPeriodoPago}
                  disabled={!filtroPlantelPeriodo}
                />
              </>
            }
            botones={
              <>
                <BotonReporte tipo="pdf" onClick={() => alert("Generar PDF")} />
                <BotonReporte tipo="excel" onClick={() => alert("Generar Excel")} />
              </>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;

const colores = {
  blue: "from-blue-500 to-blue-600",
  indigo: "from-indigo-500 to-indigo-600",
  purple: "from-purple-500 to-purple-600",
};

const CardReporte: React.FC<{
  titulo: string;
  color: keyof typeof colores;
  description: string;
  filtros: React.ReactNode;
  botones?: React.ReactNode;
}> = ({ titulo, color, description, filtros, botones }) => (
  <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
    <div className={`bg-gradient-to-r ${colores[color]} p-6 text-white relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">{titulo}</h2>
          <p className="text-blue-100 text-sm mt-1">{description}</p>
        </div>
      </div>
    </div>

    <div className="p-6">
      <div className="mb-6">{filtros}</div>
      
      {botones && (
        <div className="flex flex-col sm:flex-row gap-3">
          {botones}
        </div>
      )}
    </div>
  </div>
);

const Select: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ label, options, value, onChange, disabled }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        disabled={disabled}
        className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled 
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
            : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
        } appearance-none`}
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
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

const DateInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ label, value, onChange, disabled }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      type="date"
      disabled={disabled}
      className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        disabled 
          ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
          : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const BotonReporte: React.FC<{ tipo: "pdf" | "excel"; onClick: () => void }> = ({
  tipo,
  onClick,
}) => {
  const isPDF = tipo === "pdf";
  const buttonStyles = isPDF
    ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl";

  return (
    <button
      onClick={onClick}
      className={`${buttonStyles} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 flex-1 min-w-0`}
    >
                    <div className="flex items-center gap-2">
         {isPDF ? (
           <div className="bg-white text-red-600 px-2 py-1 rounded font-bold text-xs">
             PDF
           </div>
         ) : (
           <div className="bg-white text-green-600 px-2 py-1 rounded font-bold text-xs">
             EXCEL
           </div>
         )}
         <span className="hidden sm:inline">
           {isPDF ? "PDF" : "Excel"}
         </span>
       </div>
    </button>
  );
};
