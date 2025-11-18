"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Genera un XLSX con las facturas de un docente filtradas por plantel.
 * Normaliza relaciones que Supabase puede devolver como arrays.
 */
export async function generarReporteDocentesExcel(docenteId: string, plantelId: string) {
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

    const allRows: any[] = data ?? [];

    const filteredData = allRows.filter((row: any) => {
      const rel = Array.isArray(row.docente_relation) ? row.docente_relation[0] ?? {} : row.docente_relation ?? {};
      const plantel = Array.isArray(rel.plantel) ? rel.plantel[0] ?? {} : rel.plantel ?? {};
      return String(plantel.id) === String(plantelId);
    });

    if (filteredData.length === 0) {
      alert("No hay facturas para este docente en el plantel seleccionado.");
      return;
    }

    const rows = filteredData.map((row: any) => {
      const rel = Array.isArray(row.docente_relation) ? row.docente_relation[0] ?? {} : row.docente_relation ?? {};
      const plantel = Array.isArray(rel.plantel) ? rel.plantel[0] ?? {} : rel.plantel ?? {};
      const asignatura = Array.isArray(rel.asignatura) ? rel.asignatura[0] ?? {} : rel.asignatura ?? {};
      const periodo = Array.isArray(rel.periodo_pago) ? rel.periodo_pago[0] ?? {} : rel.periodo_pago ?? {};

      const docente = Array.isArray(row.docente) ? row.docente[0] ?? {} : row.docente ?? {};

      return {
        Folio: row.folio ?? "N/A",
        Plantel: plantel.nombre_plantel ?? "N/A",
        Docente: docente.nombre_docente ?? "N/A",
        Asignatura: asignatura.nombre_asignatura ?? "N/A",
        "Periodo de Pago": periodo.concatenado ?? "N/A",
        "Fecha de Pago": row.fecha_pago ?? "N/A",
        "Forma de Pago": row.forma_pago ?? "N/A",
        Importe: `$${Number(row.importe ?? 0).toFixed(2)}`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Docente");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, `reporte_docente_${docenteId}_plantel_${plantelId}.xlsx`);
  } catch (error) {
    console.error(error);
    alert("Error al generar el archivo Excel. Revisa la consola.");
  }
}
