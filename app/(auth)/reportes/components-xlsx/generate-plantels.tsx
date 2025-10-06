import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export async function generarReportePlantelesExcel(plantelId: string) {
  const supabase = createClientComponentClient();

  if (!plantelId) {
    alert("No se recibió un plantel válido.");
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
          plantel(nombre_plantel),
          asignatura(nombre_asignatura),
          periodo_pago(concatenado)
        )
      `)
      .eq("plantel_id", plantelId);

    if (error) throw error;

    if (!data || data.length === 0) {
      alert("No hay facturas para el plantel seleccionado.");
      return;
    }

    const rows = data.map((row) => {
      const rel = Array.isArray(row.docente_relation)
        ? row.docente_relation[0] || {}
        : row.docente_relation || {};

      return {
        Folio: row.folio || "N/A",
        Plantel: rel.plantel?.nombre_plantel || "N/A",
        Docente: row.docente?.nombre_docente || "N/A",
        Asignatura: rel.asignatura?.nombre_asignatura || "N/A",
        "Periodo de Pago": rel.periodo_pago?.concatenado || "N/A",
        "Fecha de Pago": row.fecha_pago || "N/A",
        "Forma de Pago": row.forma_pago || "N/A",
        Importe: `$${Number(row.importe).toFixed(2)}`,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(blob, "Reporte de pagos por plantel.xlsx");
  } catch (error) {
    console.error(error);
    alert("Error al generar el archivo Excel.");
  }
}
