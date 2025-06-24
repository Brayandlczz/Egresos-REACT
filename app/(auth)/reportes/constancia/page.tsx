"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { membretebase64 } from "./membretebase64";

const CartaPDFViewer: React.FC = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const generarCartaPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
    });

    doc.addImage(membretebase64, "PNG", 0, 0, 612, 792);

    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const fecha = new Date();
    const fechaFormateada = `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;

    const margenDerecho = 80;
    const xDerecha = doc.internal.pageSize.getWidth() - margenDerecho;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(fechaFormateada, xDerecha, 100, { align: "right" });
    doc.text("Tuxtla Gutiérrez, Chiapas", xDerecha, 120, { align: "right" });

    const baseY = 170;
    const margenIzquierdo = 80;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("A QUIEN CORRESPONDA", margenIzquierdo, baseY);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PRESENTE", margenIzquierdo, baseY + 20);

    const asunto = "Asunto: Carta de recomendación";
    const textWidth = doc.getTextWidth(asunto);
    const xAsunto = doc.internal.pageSize.getWidth() - margenDerecho - textWidth;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(asunto, xAsunto, baseY + 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      "El que suscribe Directora de Administración de la Universidad Internacional del Conocimiento\n" +
      "e Investigación, S.C.",
      margenIzquierdo,
      baseY + 75
    );

    doc.setFont("helvetica", "bold");
    doc.text("HACE CONSTAR", margenIzquierdo, baseY + 115); 

    doc.setFont("helvetica", "normal");
    doc.text(
      "Que el C. Puberto Alegría de la Cruz es docente de esta institución por contratación directa de\n"+
      "servicios profesionales y ha impartido las siguientes materias:",
      margenIzquierdo,
      baseY + 135
    );

    autoTable(doc, {
      startY: baseY + 170,
      head: [["Nivel Educativo", "Módulo", "Fecha"]],
      body: [
        [
          "Licenciatura",
          "► Programa Interno de Protección Civil",
          "04 al 29 de febrero de 2024\n02 al 27 de junio de 2024\n29 de septiembre al 24 de octubre 2024",
        ],
        [
          "Maestría",
          "► Maestría en Protección Civil y Gestión de Emergencias",
          "04 al 28 de febrero de 2024\n03 al 27 de marzo de 2024",
        ],
      ],
      styles: {
        fontSize: 9,
        cellPadding: 4,
        valign: "top",
      },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 0,
        fontStyle: "bold",
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || baseY + 300;

    doc.text(
      "Se extiende la presente a los 10 días del mes actual del año actual.",
      margenIzquierdo,
      finalY + 30
    );

    doc.text("Atentamente", 260, finalY + 80);
    doc.text("________________________", 220, finalY + 100);
    doc.text("MATI. JOSEFA ORTIZ DOMÍNGUEZ", 200, finalY + 120);
    doc.text("DIRECTORA DEL PLANTEL", 220, finalY + 135);

    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    setPdfUrl(url);
  };

  return (
    <div className="p-4">
      <button
        onClick={generarCartaPDF}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Generar carta PDF
      </button>

      {pdfUrl && (
        <iframe
          src={pdfUrl}
          width="100%"
          height="700px"
          className="border"
          title="Vista previa PDF"
        />
      )}
    </div>
  );
};

export default CartaPDFViewer;
