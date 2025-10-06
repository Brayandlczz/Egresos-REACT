"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { generateCartaPDF } from "./structure/generatePDF";

const CartaPDFViewer: React.FC = () => {
  const supabase = createClientComponentClient();
  const [docentes, setDocentes] = useState<any[]>([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<string>("");
  const [nombreDocente, setNombreDocente] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocentes = async () => {
      const { data, error } = await supabase
        .from("docente")
        .select("id, nombre_docente");
      if (!error && data) setDocentes(data);
    };
    fetchDocentes();
  }, [supabase]);

  const handleDocenteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docenteId = e.target.value;
    setDocenteSeleccionado(docenteId);
    const docente = docentes.find((d) => d.id === docenteId);
    setNombreDocente(docente?.nombre_docente || "");
    setPdfUrl(null);
    setError(null);
  };

  const generarCarta = async () => {
    if (!docenteSeleccionado) return;
    setLoading(true);
    setError(null);
    setPdfUrl(null);
    try {
      const pdfBlob = await generateCartaPDF(docenteSeleccionado, nombreDocente, supabase);
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (err: any) {
      setError(err.message || "Error generando PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 text-center">
      <h2 className="text-xl font-bold"> Docente | Generar Constancia de Prestación de Servicios</h2>

      <div>
        <label className="block text-sm font-medium">Docente</label>
        <select
          className="w-50 border rounded px-3 py-2"
          value={docenteSeleccionado}
          onChange={handleDocenteChange}
        >
          <option value="">Seleccione un docente</option>
          {docentes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre_docente}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={generarCarta}
        disabled={!docenteSeleccionado || loading}
        className={`px-4 py-2 text-white rounded ${
          docenteSeleccionado && !loading
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {loading ? "Generando..." : "Generar constancia"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          width="100%"
          height="630px"
          className="border"
          title="Vista previa PDF"
        />
      )}
    </div>
  );
};

export default CartaPDFViewer;
