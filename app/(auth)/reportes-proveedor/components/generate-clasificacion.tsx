"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { logoBase64 } from "@/app/(auth)/reportes/components/logobase64";

export async function generarReporteFacturasPorEtiquetaPDF(
  plantelId: string,
  etiquetaId: string
) {
  const supabase = createClientComponentClient();

  if (!plantelId || !etiquetaId) {
    alert("Se requiere seleccionar plantel y etiqueta");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("factura_proveedores")
      .select(`
        id,
        fecha,
        folio_fiscal,
        gasto,
        observacion,
        etiqueta:etiqueta (
          id,
          nombre_etiqueta  
        ),
        proveedor:proveedor_id (
          nombre_proveedor,
          numero_proveedor
        )
      `)
      .eq("plantel_id", plantelId)
      .eq("etiqueta", etiquetaId)
      .order("fecha", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      alert("No hay facturas para el plantel y etiqueta seleccionados.");
      return;
    }

    const facturasPorEtiqueta: Record<string, any[]> = {};
    data.forEach((factura: any) => {
      const etiquetaNombre = factura.etiqueta?.[0]?.nombre_etiqueta ?? "Sin Etiqueta";
      if (!facturasPorEtiqueta[etiquetaNombre]) facturasPorEtiqueta[etiquetaNombre] = [];
      facturasPorEtiqueta[etiquetaNombre].push(factura);
    });

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
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
    doc.text(
      "Universidad Internacional del Conocimiento e Investigación SC.",
      textX,
      textY
    );
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
    doc.text(
      `Reporte generado el día: ${fechaActual}`,
      pageWidth - margin,
      textY,
      { align: "right" }
    );
    textY += 6;
    doc.setFont("helvetica", "bold");
    const nombreEtiqueta = data[0]?.etiqueta?.[0]?.nombre_etiqueta ?? "Sin Etiqueta";
    doc.text(
      `Reporte filtrado por: Etiqueta "${nombreEtiqueta}"`,
      pageWidth - margin,
      textY,
      { align: "right" }
    );

    doc.line(margin, logoY + logoHeight + 8, pageWidth - margin, logoY + logoHeight + 8);

    doc.setFontSize(14);
    doc.text(
      "REPORTE DE FACTURAS POR CLASIFICACIÓN DE GASTO",
      pageWidth / 2,
      logoY + logoHeight + 15,
      { align: "center" }
    );

    let startY = logoY + logoHeight + 25;

    for (const [etiquetaNombre, facturas] of Object.entries(facturasPorEtiqueta)) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(etiquetaNombre, margin, startY);
      startY += 8;

      autoTable(doc, {
        startY,
        head: [
          ["Fecha", "Folio Fiscal", "Proveedor", "Número Proveedor", "Gasto", "Observación"],
        ],
        body: facturas.map((f: any) => [
          f.fecha ? new Date(f.fecha).toLocaleDateString("es-MX") : "-",
          f.folio_fiscal ?? "-",
          f.proveedor?.nombre_proveedor ?? "N/A",
          f.proveedor?.numero_proveedor ?? "N/A",
          `$${Number(f.gasto ?? 0).toFixed(2)}`,
          f.observacion ?? "",
        ]),
        styles: { fontSize: 9, cellPadding: 2, halign: "center" },
        headStyles: {
          fillColor: [255, 165, 0],
          textColor: 0,
          halign: "center",
          fontStyle: "bold",
        },
        columnStyles: {
          4: { halign: "center" },
        },
        margin: { left: margin, right: margin },
        didDrawPage: (dataArg: any) => {
          if (dataArg && dataArg.cursor && typeof dataArg.cursor.y === "number") {
            startY = dataArg.cursor.y + 10;
          } else {
            startY = startY + 10;
          }
        },
      });

      const totalEtiqueta = facturas.reduce((acc: number, f: any) => acc + Number(f.gasto ?? 0), 0);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Total gasto para "${etiquetaNombre}": $${totalEtiqueta.toFixed(2)}`,
        margin + 4,
        startY
      );
      startY += 15;

      if (startY > pageHeight - margin - 30) {
        doc.addPage();
        startY = margin;
      }
    }

    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  } catch (error) {
    alert("Error al generar el reporte, revisa la consola.");
    console.error(error);
  }
}
