"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logoBase64 } from "./logobase64";

export async function generarReporteDocentes(docenteId: string, plantelId: string) {
  const supabase = createClientComponentClient();

  if (!docenteId || !plantelId) {
    alert("No se recibió un docente o plantel válido.");
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
          plantel(id, nombre_plantel),
          asignatura(nombre_asignatura),
          periodo_pago(concatenado)
        )
      `)
      .eq("docente_id", docenteId);

    if (error) throw error;

    const filteredData = data.filter((row) => {
      const rel = Array.isArray(row.docente_relation)
        ? row.docente_relation[0] || {}
        : row.docente_relation || {};

      const plantel = Array.isArray(rel.plantel)
        ? rel.plantel[0] || {}
        : rel.plantel || {};

      return plantel.id === plantelId;
    });

    if (filteredData.length === 0) {
      alert("No hay facturas para este docente en el plantel seleccionado.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    const logoX = 20;
    const logoY = 10;
    const logoWidth = 40;
    const logoHeight = 35;

    doc.addImage(logoBase64, "WEBP", logoX, logoY, logoWidth, logoHeight);

    const textX = logoX + logoWidth + 10;
    const centerY = logoY + logoHeight / 2;
    const textBlockHeight = 4 * 6;
    let textY = centerY - textBlockHeight / 3.2 + 3.2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Universidad Internacional del Conocimiento e Investigación SC.", textX, textY);

    doc.setFont("helvetica", "normal");
    textY += 6;
    doc.text("RFC: UIC121124DH1", textX, textY);
    textY += 6;
    doc.text("Sucursal: Blvd. Belisario Domínguez 3525 Col. Terán", textX, textY);
    textY += 6;
    doc.text("Tel. 961615657", textX, textY);

    const fechaActual = new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    textY = logoY + 13;
    doc.setFont("helvetica", "bold");
    doc.text(`Reporte generado el día: ${fechaActual}`, pageWidth - margin, textY, {
      align: "right",
    });

    textY += 6;
    doc.text(`Reporte filtrado por: Docente y Plantel`, pageWidth - margin, textY, {
      align: "right",
    });

    doc.line(margin, logoY + logoHeight + 5, pageWidth - margin, logoY + logoHeight + 5);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE PAGO A DOCENTES", pageWidth / 2, logoY + logoHeight + 15, {
      align: "center",
    });

    autoTable(doc, {
      startY: logoY + logoHeight + 20,
      head: [
        [
          "Folio",
          "Plantel",
          "Docente",
          "Asignatura",
          "Periodo de Pago",
          "Fecha de Pago",
          "Forma de Pago",
          "Importe",
        ],
      ],
      body: filteredData.map((row) => {
        const rel = Array.isArray(row.docente_relation)
          ? row.docente_relation[0] || {}
          : row.docente_relation || {};

        const plantel = Array.isArray(rel.plantel)
          ? rel.plantel[0] || {}
          : rel.plantel || {};

        return [
          row.folio || "N/A",
          plantel.nombre_plantel || "N/A",
          row.docente?.nombre_docente || "N/A",
          rel.asignatura?.nombre_asignatura || "N/A",
          rel.periodo_pago?.concatenado || "N/A",
          row.fecha_pago || "N/A",
          row.forma_pago || "N/A",
          `$${Number(row.importe).toFixed(2)}`,
        ];
      }),
      styles: {
        fontSize: 9,
        cellPadding: 2,
        halign: "center",
      },
      headStyles: {
        fillColor: [255, 165, 0],
        textColor: 0,
        halign: "center",
        fontStyle: "bold",
      },
      columnStyles: {
        7: { halign: "right" },
      },
    });

    const totalImporte = filteredData.reduce((acc, row) => acc + Number(row.importe), 0);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total pagado: $${totalImporte.toFixed(2)}`,
      margin + 4,
      (doc as any).lastAutoTable.finalY + 10
    );

    // ✅ Vista previa en nueva pestaña
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");

  } catch (error) {
    console.error(error);
    alert("Error al obtener facturas. Revisa la consola.");
  }
}

interface BotonReportePDFProps {
  docenteId: string;
  plantelId: string;
}

export const BotonReportePagosPDF: React.FC<BotonReportePDFProps> = ({
  docenteId,
  plantelId,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!docenteId || !plantelId) {
      alert("Selecciona un docente y un plantel válidos.");
      return;
    }
    setLoading(true);
    await generarReporteDocentes(docenteId, plantelId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded mt-4"
      disabled={loading}
    >
      {loading ? "Generando..." : "Vista previa del reporte PDF"}
    </button>
  );
};
