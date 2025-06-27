"use client";

import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { membretebase64 } from "./membretebase64";

const CartaPDFViewer: React.FC = () => {
  const supabase = createClientComponentClient();
  const [docentes, setDocentes] = useState<any[]>([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<string>("");
  const [nombreDocente, setNombreDocente] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const numeroATexto = (num: number): string => {
    const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const especiales = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const decenas = ["", "", "veinte", "treinta"];

    if (num === 0) return "cero";
    if (num < 10) return unidades[num];
    if (num >= 10 && num < 20) return especiales[num - 10];
    if (num === 20) return "veinte";
    if (num > 20 && num < 30) return "veinti" + unidades[num - 20];
    if (num === 30) return "treinta";
    if (num === 31) return "treinta y uno";
    return "";
  };

  const anioATexto = (anio: number): string => {
    if (anio < 2000 || anio > 2099) return anio.toString();

    const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const especiales = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const decenas = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];

    const mil = "dos mil";
    const resto = anio - 2000; 

    if (resto === 0) return mil;

    if (resto < 10) return `${mil} ${unidades[resto]}`;
    if (resto >= 10 && resto < 20) return `${mil} ${especiales[resto - 10]}`;

    const dec = Math.floor(resto / 10);
    const uni = resto % 10;

    if (uni === 0) return `${mil} ${decenas[dec]}`;

    return `${mil} ${decenas[dec]} y ${unidades[uni]}`;
  };

  useEffect(() => {
    const fetchDocentes = async () => {
      const { data, error } = await supabase
        .from("docente")
        .select("id, nombre_docente");
      if (!error && data) setDocentes(data);
    };
    fetchDocentes();
  }, []);

  const handleDocenteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docenteId = e.target.value;
    setDocenteSeleccionado(docenteId);
    const docente = docentes.find((d) => d.id === docenteId);
    setNombreDocente(docente?.nombre_docente || "");
  };

  const formatearFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "Sin fecha";
    const fecha = new Date(fechaStr);
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const limpiarTexto = (texto: string) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/[^a-zA-Z0-9.,:;()¿?¡!&@ \n]/g, "");

  const generarCartaPDF = async () => {
    if (!docenteSeleccionado) return;

    const { data: relations, error } = await supabase
      .from("docente_relations")
      .select("*")
      .eq("docente_id", docenteSeleccionado);

    if (error || !relations) {
      console.error("Error al obtener relaciones:", error?.message);
      return;
    }

    const detalles = await Promise.all(
      relations.map(async (rel) => {
        const [{ data: asignatura }, { data: oferta }, { data: periodo }] = await Promise.all([
          supabase.from("asignatura").select("nombre_asignatura").eq("id", rel.asignatura_id).single(),
          supabase.from("oferta_educativa").select("nombre_oferta").eq("id", rel.oferta_educativa_id).single(),
          supabase.from("periodo_pago").select("fecha_inicio, fecha_fin").eq("id", rel.periodo_pago_id).single()
        ]);

        return {
          nivel: limpiarTexto(oferta?.nombre_oferta || "Sin nivel"),
          asignatura: limpiarTexto(asignatura?.nombre_asignatura || "Sin asignatura"),
          fecha: limpiarTexto(`${formatearFecha(periodo?.fecha_inicio)} al ${formatearFecha(periodo?.fecha_fin)}`)
        };
      })
    );

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter" });
    doc.addImage(membretebase64, "PNG", 0, 0, 612, 792);

    const fecha = new Date();
    const margenDerecho = 80;
    const margenIzquierdo = 80;
    const xDerecha = doc.internal.pageSize.getWidth() - margenDerecho;
    const baseY = 170;
    const maxTextWidth = xDerecha - margenIzquierdo;

    doc.setFont("helvetica", "bold").setFontSize(12);
    const fechaFormateada = `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
    doc.text(fechaFormateada, xDerecha, 100, { align: "right" });
    doc.text("Tuxtla Gutiérrez, Chiapas", xDerecha, 120, { align: "right" });

    doc.setFontSize(14);
    doc.text("A QUIEN CORRESPONDA", margenIzquierdo, baseY);
    doc.setFontSize(12);
    doc.text("PRESENTE", margenIzquierdo, baseY + 20);
    doc.text("Asunto: Carta de recomendación", xDerecha, baseY + 45, { align: "right" });

    const texto1 =
      "El que suscribe Directora de administración de la Universidad Internacional del Conocimiento e Investigación, S.C.";
    const texto2 = "HACE CONSTAR";
    const texto3 = `Que el C. ${limpiarTexto(nombreDocente)} es docente de esta institución por contratación directa de servicios profesionales y ha impartido las siguientes materias:`;

    doc.setFont("helvetica", "normal");

    let y = baseY + 75;
    const lineHeight = 14;

    doc.setFontSize(11);
    const texto1Ajustado = doc.splitTextToSize(texto1, maxTextWidth);
    doc.text(texto1Ajustado, margenIzquierdo, y);
    y += texto1Ajustado.length * lineHeight;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(texto2, margenIzquierdo, y + 10);
    y += lineHeight + 10;

    doc.setFont("helvetica", "normal");
    const texto3Ajustado = doc.splitTextToSize(texto3, maxTextWidth);
    doc.text(texto3Ajustado, margenIzquierdo, y);
    y += texto3Ajustado.length * lineHeight;

    autoTable(doc, {
      startY: y + 10,
      head: [["Nivel Educativo", "Módulo", "Fecha"]],
      body: detalles.map((d) => [d.nivel, `• ${d.asignatura}`, d.fecha]),
      styles: { fontSize: 9, cellPadding: 4, valign: "top" },
      headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: "bold" },
      margin: { left: margenIzquierdo, right: margenDerecho },
      tableWidth: xDerecha - margenIzquierdo,
    });

    const finalY = (doc as any).lastAutoTable.finalY || (y + 200);

    const diaTexto = numeroATexto(fecha.getDate());
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    const anioTexto = anioATexto(anio);

    const textoExtiende = `Se extiende a los ${diaTexto} días del mes de ${mes} del año ${anioTexto}.`;
    const textoWidth = doc.getTextWidth(textoExtiende);
    const xCentered = margenIzquierdo + (maxTextWidth - textoWidth) / 2;

    doc.text(textoExtiende, xCentered, finalY + 30);

    const firmaXCenter = margenIzquierdo + maxTextWidth / 2;

    doc.text("Atentamente", firmaXCenter - doc.getTextWidth("Atentamente") / 2, finalY + 80);
    doc.text("________________________", firmaXCenter - doc.getTextWidth("________________________") / 2, finalY + 100);
    doc.text("MATI. MARTHA EDITH GONZÁLEZ BRAVO", firmaXCenter - doc.getTextWidth("MATI. MARTHA EDITH GONZÁLEZ BRAVO") / 2, finalY + 120);
    doc.text("DIRECTORA DEL PLANTEL", firmaXCenter - doc.getTextWidth("DIRECTORA DEL PLANTEL") / 2, finalY + 135);

    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  return (
    <div className="p-4 space-y-4">
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
        onClick={generarCartaPDF}
        disabled={!docenteSeleccionado}
        className={`px-4 py-2 text-white rounded ${
          docenteSeleccionado ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Generar constancia
      </button>

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
