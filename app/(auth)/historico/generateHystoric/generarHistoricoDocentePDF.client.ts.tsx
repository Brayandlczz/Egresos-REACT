'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from '@/app/(auth)/reportes/components/logobase64';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface HistoricoItem {
  docente_relation_id: string;
  nombre_asignatura: string;
  fecha_inicio: string;
  fecha_fin: string;
  importe_total_pago: number;
  total_pagado: number;
  saldo_restante: number;
  primer_pago: string | null;
  ultimo_pago: string | null;
}

export async function generarHistoricoDocentePDF(docenteId: string, nombreDocente: string) {
  if (!docenteId) {
    alert('ID de docente inválido.');
    return;
  }

  const supabase = createClientComponentClient();

  const { data, error } = await supabase.rpc('sp_historico_pagos_por_docente', { p_docente_id: docenteId });

  if (error) {
    alert('Error al obtener el histórico de pagos.');
    console.error(error);
    return;
  }

  const rows = (data ?? []) as HistoricoItem[];

  if (!rows || rows.length === 0) {
    alert('No hay datos disponibles para este docente.');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  doc.addImage(logoBase64, 'WEBP', 20, 10, 40, 35);

  const textX = 70;
  let textY = 18;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Universidad Internacional del Conocimiento e Investigación SC.', textX, textY);
  doc.setFont('helvetica', 'normal');
  textY += 6;
  doc.text('RFC: UIC121124DH1', textX, textY);
  textY += 6;
  doc.text('Sucursal: Blvd. Belisario Domínguez 3525 Col. Terán', textX, textY);
  textY += 6;
  doc.text('Tel. 961615657', textX, textY);

  const fechaActual = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.setFont('helvetica', 'bold');
  doc.text(`Reporte generado el día: ${fechaActual}`, pageWidth - margin, 20, { align: 'right' });
  doc.text(`Docente: ${nombreDocente}`, pageWidth - margin, 26, { align: 'right' });

  doc.line(margin, 50, pageWidth - margin, 50);
  doc.setFontSize(14);
  doc.text('HISTÓRICO DE PAGOS POR DOCENTE', pageWidth / 2, 60, { align: 'center' });

  autoTable(doc, {
    startY: 65,
    head: [[
      'Módulo', 'Inicio del módulo', 'Fin del módulo',
      'Total a pagar', 'Monto Cubierto', 'Saldo Restante',
      'Primer Pago', 'Último Pago', 'Estatus del pago'
    ]],
    body: rows.map((item: HistoricoItem) => {
      const estado =
        item.total_pagado > item.importe_total_pago ? 'Excedido' :
        item.total_pagado === item.importe_total_pago ? 'Pagado' : 'Pendiente';

      return [
        item.nombre_asignatura,
        item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() : '-',
        item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : '-',
        `$${(item.importe_total_pago ?? 0).toFixed(2)}`,
        `$${(item.total_pagado ?? 0).toFixed(2)}`,
        `$${(item.saldo_restante ?? 0).toFixed(2)}`,
        item.primer_pago ? new Date(item.primer_pago).toLocaleDateString() : '-',
        item.ultimo_pago ? new Date(item.ultimo_pago).toLocaleDateString() : '-',
        estado,
      ];
    }),
    styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: [255, 165, 0], textColor: 0, fontStyle: 'bold' },
  });

  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
}
