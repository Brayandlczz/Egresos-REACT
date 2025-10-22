"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { logoBase64 } from "@/app/(auth)/reportes/components/logobase64";

export async function generarReporteFacturasPorProveedorPDF(proveedorId: string) {
  if (!proveedorId) {
    alert("Proveedor inválido");
    return;
  }

  const supabase = createClientComponentClient();

  try {
    const { data, error } = await supabase
      .from("factura_proveedores")
      .select(`
        id,
        fecha,
        folio_fiscal,
        gasto,
        observacion,
        planta:plantel_id (
          nombre_plantel
        ),
        proveedor:proveedor_id (
          nombre_proveedor,
          numero_proveedor,
          tipo_persona
        )
      `)
      .eq("proveedor_id", proveedorId)
      .order("fecha", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      alert("No se encontraron facturas para este proveedor.");
      return;
    }

    // Normalizamos proveedor: puede venir como array -> tomar primer elemento
    let proveedorRaw = data[0].proveedor;
    const proveedor = Array.isArray(proveedorRaw) ? proveedorRaw[0] ?? {} : proveedorRaw ?? {};

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
    const fechaY = logoY + 13;
    doc.setFont("helvetica", "bold");
    doc.text(`Reporte generado el día: ${fechaActual}`, pageWidth - margin, fechaY, {
      align: "right",
    });

    // Protegemos proveedor.nombre_proveedor y numero_proveedor por si vienen undefined
    const nombreProveedor = proveedor?.nombre_proveedor ?? "Proveedor desconocido";
    const numeroProveedor = proveedor?.numero_proveedor ?? "N/A";

    doc.text(
      `Proveedor: ${nombreProveedor} (No. ${numeroProveedor})`,
      pageWidth - margin,
      fechaY + 6,
      { align: "right" }
    );

    doc.line(margin, logoY + logoHeight + 5, pageWidth - margin, logoY + logoHeight + 5);

    doc.setFontSize(14);
    doc.text(
      "REPORTE DE FACTURAS POR PROVEEDOR",
      pageWidth / 2,
      logoY + logoHeight + 15,
      { align: "center" }
    );

    autoTable(doc, {
      startY: logoY + logoHeight + 20,
      head: [
        ["Fecha", "Folio Fiscal", "Plantel", "Gasto correspondiente", "Observación"],
      ],
      body: data.map((f: any) => [
        f.fecha ? new Date(f.fecha).toLocaleDateString("es-MX") : "N/A",
        f.folio_fiscal ?? "N/A",
        // planta (plantel) también puede venir como array — protegemos acceso
        Array.isArray(f.planta) ? (f.planta[0]?.nombre_plantel ?? "N/A") : (f.planta?.nombre_plantel ?? "N/A"),
        `$${Number(f.gasto ?? 0).toFixed(2)}`,
        f.observacion || "",
      ]),
      styles: { fontSize: 9, cellPadding: 2, halign: "center" },
      headStyles: {
        fillColor: [255, 165, 0],
        textColor: 0,
        halign: "center",
        fontStyle: "bold",
      },
      columnStyles: {
        3: { halign: "center" },
      },
    });

    const totalGasto = data.reduce((acc: number, f: any) => acc + Number(f.gasto ?? 0), 0);
    doc.setFont("helvetica", "bold");

    // fallback seguro para finalY del autoTable
    const lastAutoTable: any = (doc as any).lastAutoTable;
    const finalY = lastAutoTable && typeof lastAutoTable.finalY === "number" ? lastAutoTable.finalY : logoY + logoHeight + 20 + 10;

    doc.text(
      `Total gastado: $${totalGasto.toFixed(2)}`,
      margin + 4,
      finalY + 10
    );

    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  } catch (error) {
    alert("Error al generar el reporte, revisa la consola.");
    console.error(error);
  }
}
