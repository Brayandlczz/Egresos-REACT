"use client";

import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { logoBase64 } from "@/app/(auth)/reportes/components/logobase64";

/**
 * Genera un reporte PDF con totales por proveedor (filtrado opcional por plantel).
 * Normaliza la respuesta de Supabase para que las relaciones (que a veces vienen como arrays)
 * se conviertan en objetos manejables.
 */
export async function generarReporteProveedoresPDF(plantelId?: string) {
  const supabase = createClientComponentClient();

  try {
    const { data, error } = await supabase
      .from("factura_proveedores")
      .select(
        `
        gasto,
        proveedor:proveedor_id (
          id,
          numero_proveedor,
          nombre_proveedor,
          tipo_persona,
          plantel:plantel_id ( nombre_plantel )
        )
      `
      )
      // si plantelId está presente, filtramos por plantel_id; si no, no filtramos
      .eq(plantelId ? "plantel_id" : "id", plantelId ?? "");

    if (error) throw error;

    if (!data || data.length === 0) {
      alert("No hay facturas disponibles.");
      return;
    }

    // Agrupar totales por proveedor, normalizando proveedor y su plantel si vienen como arrays
    const totalesPorProveedor: Record<
      string,
      {
        plantel: string;
        numero_proveedor: string;
        nombre_proveedor: string;
        tipo_persona: string;
        total_gastado: number;
      }
    > = {};

    data.forEach((row: any) => {
      let p = row.proveedor;

      // Normalizar: si `proveedor` viene como array, tomar el primer elemento
      if (Array.isArray(p)) {
        p = p[0];
      }

      if (!p) return;

      // clave segura: usa id si existe, sino número de proveedor, sino nombre
      const key = p.id ?? p.numero_proveedor ?? p.nombre_proveedor ?? JSON.stringify(p);
      if (!key) return;

      // plantel dentro del proveedor también puede venir como array -> normalizamos
      const plantelObj = Array.isArray(p.plantel) ? p.plantel[0] ?? {} : p.plantel ?? {};

      if (!totalesPorProveedor[key]) {
        totalesPorProveedor[key] = {
          plantel: plantelObj?.nombre_plantel ?? "N/A",
          numero_proveedor: p.numero_proveedor ?? "N/A",
          nombre_proveedor: p.nombre_proveedor ?? "N/A",
          tipo_persona: p.tipo_persona ?? "N/A",
          total_gastado: 0,
        };
      }

      totalesPorProveedor[key].total_gastado += Number(row.gasto ?? 0);
    });

    const filas = Object.values(totalesPorProveedor);
    if (filas.length === 0) {
      alert("No se encontraron totales para el criterio seleccionado.");
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

    /* Fecha y criterio de filtrado */
    const fechaActual = new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    textY = logoY + 13;
    doc.setFont("helvetica", "bold");
    doc.text(`Reporte generado el día: ${fechaActual}`, pageWidth - margin, textY, { align: "right" });
    textY += 6;
    doc.text(`Reporte filtrado por: ${plantelId ? "Plantel" : "Todos los planteles"}`, pageWidth - margin, textY, {
      align: "right",
    });

    doc.line(margin, logoY + logoHeight + 5, pageWidth - margin, logoY + logoHeight + 5);

    doc.setFontSize(14);
    doc.text("REPORTE DE PAGO A PROVEEDORES POR PLANTEL", pageWidth / 2, logoY + logoHeight + 15, { align: "center" });

    autoTable(doc, {
      startY: logoY + logoHeight + 20,
      head: [
        ["Plantel", "Número de proveedor", "Nombre del Proveedor", "Tipo de Persona", "Total Pagado"],
      ],
      body: filas.map((f) => [
        f.plantel,
        f.numero_proveedor,
        f.nombre_proveedor,
        f.tipo_persona,
        `$${f.total_gastado.toFixed(2)}`,
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
    });

    // finalY: fallback por si lastAutoTable no está presente
    const lastAutoTable: any = (doc as any).lastAutoTable;
    const finalY = lastAutoTable && typeof lastAutoTable.finalY === "number" ? lastAutoTable.finalY : logoY + logoHeight + 20 + 10;

    const totalGlobal = filas.reduce((acc, f) => acc + f.total_gastado, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Total global pagado: $${totalGlobal.toFixed(2)}`, margin + 4, finalY + 10);

    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  } catch (err) {
    alert("Error al generar el reporte. Revisa la consola.");
    console.error(err);
  }
}

interface BotonReporteProveedoresPDFProps {
  plantelId?: string;
}

export const BotonReporteProveedoresPDF: React.FC<BotonReporteProveedoresPDFProps> = ({ plantelId }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await generarReporteProveedoresPDF(plantelId);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded mt-4 disabled:opacity-60"
      disabled={loading}
    >
      {loading ? "Generando..." : "Vista previa del reporte PDF"}
    </button>
  );
};
