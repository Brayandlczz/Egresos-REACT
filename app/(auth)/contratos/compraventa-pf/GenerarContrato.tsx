'use client';

import { useEffect, useRef } from "react";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import type { CompraventaPFFormValues } from '@/app/(auth)/contratos/compraventa-pf/tipos';

function fechaLegibleDesdeISO(iso: string) {
  const d = iso ? new Date(iso) : new Date();
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };
  return d.toLocaleDateString("es-MX", opts);
}
function mxn(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n || 0);
}
function numeroALetrasMX(n: number): string {
  const enteros = Math.floor(Math.abs(n));
  const centavos = Math.round((Math.abs(n) - enteros) * 100);
  const letrasEnteros = convertirEnteros(enteros);
  const sufijo = ` ${String(centavos).padStart(2, "0")}/100 M.N.`;
  return `${letrasEnteros} PESOS${sufijo}`;
}
const U = [
  "", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE",
];
function decenasALetras(n: number): string {
  if (n <= 20) return U[n];
  const d = Math.floor(n / 10), u = n % 10;
  const N = ["", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  if (d === 2) return (`VEINTI${u ? U[u].toLowerCase() : ""}`).toUpperCase();
  if (u === 0) return N[d];
  return `${N[d]} Y ${U[u]}`;
}
function centenasALetras(n: number): string {
  if (n < 100) return decenasALetras(n);
  if (n === 100) return "CIEN";
  const c = Math.floor(n / 100), r = n % 100;
  const N = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
  return `${N[c]}${r ? " " + decenasALetras(r) : ""}`;
}
function convertirEnteros(n: number): string {
  if (n === 0) return "CERO";
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1_000);
  const cientos = n % 1_000;
  const partes: string[] = [];
  if (millones) partes.push(millones === 1 ? "UN MILLÓN" : `${centenasALetras(millones)} MILLONES`);
  if (miles) partes.push(miles === 1 ? "MIL" : `${centenasALetras(miles)} MIL`);
  if (cientos) partes.push(centenasALetras(cientos));
  return partes.join(" ").replace(/\s+/g, " ").trim();
}

type Props = {
  values: CompraventaPFFormValues;
  autoExportOnValuesChange?: boolean;
  onExportDone?: () => void;
};

export default function ContratoCompraventaPF({
  values,
  autoExportOnValuesChange = false,
  onExportDone,
}: Props) {
  const generarDocx = async () => {
    const fecha = fechaLegibleDesdeISO(values.fechaActualISO);

    const pagoMedioMap: Record<CompraventaPFFormValues["pagoMedio"], string> = {
      transferencia: "transferencia electrónica",
      cuenta_bancaria_prestador: "transferencia electrónica a la cuenta bancaria de EL VENDEDOR",
      efectivo: "pago en efectivo",
      cheque: "pago con cheque",
    };
    const pagoMedioTxt = pagoMedioMap[values.pagoMedio];

    const anticipoPct = values.pagoEsquema === 'anticipo_1' ? (values.anticipoPct ?? 50) : 0;
    const importeAnticipo = values.pagoEsquema === 'anticipo_1' ? (values.importeAnticipo ?? 0) : 0;
    const importeAnticipoTexto = importeAnticipo
      ? `${mxn(importeAnticipo)} (${numeroALetrasMX(importeAnticipo)})`
      : `${anticipoPct}%`;

    const domicilioEntrega = values.entregaDomicilioSucursal || values.sucursalNombre || "_________________________";
    const correoProv = values.correoProveedor || "correo@proveedor.com";
    const plazoEntrega = (values.plazoEntregaDias ?? "_____").toString();
    const condicionSegundoPago = values.pagoEsquema === 'anticipo_1'
      ? (values.condicionSegundoPago || "al día siguiente")
      : "en la fecha convenida";

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "Arial", size: 24 },
            paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 276 } },
          },
        },
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              spacing: { after: 400 },
              alignment: AlignmentType.END,
              children: [new TextRun({ text: "CONTRATO DE COMPRAVENTA PF.", bold: true, size: 24 })],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun(
                  `En la ciudad de Tuxtla Gutiérrez, Chiapas; a ${fecha}, comparece por una parte la Universidad Internacional del Conocimiento e Investigación, S. C. a través de su representante legal Dra. María Xóchilt Ortega Grillasca, quien en lo sucesivo se denominará “LA COMPRADORA”, y por la otra la persona física ${values.proveedorNombre}, quien en lo sucesivo se denominará “EL VENDEDOR”; ambas partes manifiestan tener concertado un contrato de compraventa de ${values.articulosComprar || "(artículos a comprar)"}, que formalizan al tenor de las siguientes declaraciones y cláusulas:`
                ),
              ],
            }),

            new Paragraph({ spacing: { after: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DECLARACIONES", bold: true })] }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("A). - DE LA COMPRADORA:")] }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("1.- Que es una persona moral constituida conforme a la legislación mexicana, lo cual acredita con el Instrumento Notarial número CUATRO MIL CUATROCIENTOS CINCUENTA Y DOS, VOLUMEN NÚMERO CINCUENTA Y TRES, expedida por el Lic. Emmanuel Nivón González en calidad de Notario Público número 144, de Tapachula de Córdova y Ordoñez, Chiapas.")],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("2.- Que en este acto es representada por la Dra. María Xóchilt Ortega Grillasca, en su carácter de representante legal, lo cual acredita mediante el instrumento señalado en el numeral anterior, personalidad que no le ha sido revocada o limitada a la fecha de la celebración del presente contrato.")],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`3.- Que señala como domicilio para los efectos de este contrato, el ubicado en ${values.sucursalNombre || "_________________________"}; mismo que señala para oír y recibir todo tipo de notificaciones.`)],
            }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("4.- El lugar donde se encuentra su domicilio actual lo tiene en calidad de título de propiedad.")] }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("5.- Que su actividad preponderante es la enseñanza del conocimiento a través de estudios universitarios, en preparatoria, y todas aquellas actividades que tienen como propósito el desarrollo de la capacitación con fines educativos.")],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`6.- Que le es indispensable para cumplir con su objeto social, comprar ${values.descripcionCompra || "(descripción de la compra)"}.`)],
            }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("B). - DE EL VENDEDOR.")] }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`1.- Manifiesta la persona física C. ${values.proveedorNombre}, ser una persona física mexicana, lo cual acredita con registro federal de contribuyente ${values.proveedorRFC}, expedida por Secretaría de Hacienda y Crédito Público.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`2.- Que en este acto es representada por el C. ${values.proveedorNombre}, en su carácter de representante legal, el que acredita mediante el instrumento señalado en el numeral anterior a la fecha de la celebración del presente contrato.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`3.- Que tiene su domicilio fiscal en ${values.proveedorDomicilio}; el cual acredita en este momento a través de su constancia de situación fiscal; mismo que señala para oír y recibir todo tipo de notificaciones.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`4.- El lugar donde se encuentra su domicilio actual lo tiene en calidad de ${values.proveedorTipoBien}.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`5.- Que su actividad preponderante es ${values.actividadPreponderante}.`)],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun("6.- Manifiesta que cuenta con material suficiente para llevar a cabo la compraventa, así como el personal suficiente para cumplir con sus obligaciones de entrega de mercancías; que no existe coacción física, verbal, ni psicológica para comprometerse, y además que no tiene ningún impedimento legal para formalizar el presente contrato.")],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`Con las declaraciones anteriores, las referidas partes han acordado celebrar un contrato de compraventa ${values.articulosComprar ? `de ${values.articulosComprar}` : ""}, el cual se sujeta a las siguientes:`)],
            }),

            new Paragraph({ spacing: { after: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CLAUSULAS", bold: true })] }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`UNO. OBJETO DEL CONTRATO. - EL VENDEDOR manifiesta que cuenta con ${values.articulosComprar || "(artículos a comprar)"}. Por lo que es su libre voluntad vender los productos mencionados a LA COMPRADORA.`)],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("DOS. DEL PRECIO. - Ambos contratantes acuerdan que el precio del producto o mercancía será el que dé a conocer EL VENDEDOR a través de lista de precios de productos que deberá enviar al correo electrónico admon.egresos@unici.edu.mx con copia a facturas@unici.edu.mx de LA COMPRADORA.")],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`LA COMPRADORA deberá avisar por teléfono que enviará al correo electrónico ${correoProv} de EL VENDEDOR en el que informará que ha enviado un pedido con las siguientes características:`)],
            }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("• Lista de los productos requeridos.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("• Cantidad.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("• Precio unitario.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("• Precio total, y")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("• Firmado por LA COMPRADORA.")] }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`Una vez que EL VENDEDOR reciba a través del correo electrónico el pedido firmado por LA COMPRADORA, deberá enviar los productos que le son pedidos en el término de ${plazoEntrega} días al domicilio ubicado en ${domicilioEntrega}.`)] ,
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("TRES. DE LA FACTURA. - EL VENDEDOR deberá entregar su CFDI (factura(s)) a nombre de LA COMPRADORA para que le sea pagada la mercancía.")],
            }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("Además, para dar cumplimiento a las leyes fiscales, deberá proporcionar a LA COMPRADORA la siguiente información y documentación:")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("1.- Constancia de situación fiscal actualizada.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("*Notificar los cambios relacionados con su domicilio fiscal a fin de poder actualizar la base de datos para la emisión de su CFDI.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("2.- Formato 32-D Opinión del cumplimiento de obligaciones fiscales actualizado “con opinión positiva”.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("3.- Opinión del cumplimiento de obligaciones ante el IMSS e INFONAVIT actualizada “con opinión positiva”.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("4.- Comprobante de domicilio (no mayor a dos meses) coincidente con el que indica la constancia de situación fiscal.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("5.- Identificación oficial vigente.")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("6.- Carátula de estado de cuenta donde se visualice la clave interbancaria y número de cuenta actualizada (no mayor a dos meses).")] }),
            new Paragraph({ spacing: { after: 400 }, children: [new TextRun("La documentación deberá ser enviada de forma escaneada (no foto) al correo electrónico facturas@unici.edu.mx")] }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`CUATRO. FORMA DE PAGO. - El pago de los productos se hará a través de ${pagoMedioTxt} de EL VENDEDOR, previo envío del CFDI (factura). Por el solo hecho de hacerse la transferencia de pago se tendrá por aceptado el pago por EL VENDEDOR, sin más requisito alguno.`)],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun(
`CINCO. ENTREGA DE MERCANCÍA Y PAGOS. - Ambos acuerdan que la mercancía será enviada al domicilio de LA COMPRADORA, desde el momento en que EL VENDEDOR haya recibido ${values.pagoEsquema === 'anticipo_1' ? `en concepto de anticipo el ${anticipoPct}%${importeAnticipo ? `, equivalente a ${importeAnticipoTexto}` : ""}` : "como pago único el total del pedido"} del precio de los artículos solicitados.`
                ),
              ],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`Debiendo pagar LA COMPRADORA el resto pendiente ${condicionSegundoPago} una vez recibida la mercancía.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("En caso de que las cosas objeto de contrato al recibirlas se encuentren averiadas, o no sean de la calidad solicitada en el pedido, EL VENDEDOR se compromete a cambiarlas de manera inmediata en cuanto le dé aviso LA COMPRADORA por teléfono o correo electrónico. Entre tanto, el pago deberá hacerse hasta que los productos se restituyan.")],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`SEIS. DE LA GARANTÍA. - EL VENDEDOR ofrece como garantía de las cosas objeto de compraventa el plazo de ${values.plazoGarantiaDias || 30} días contado a partir de que entregue el total de ${values.descripcionCompra || "(la mercancía solicitada)"} . Para hacer efectiva la garantía bastará con que LA COMPRADORA dé aviso por teléfono y correo electrónico de los productos que sean defectuosos.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`La garantía consistirá en que EL VENDEDOR restituya a LA COMPRADORA ${values.articulosComprar || "(artículos a comprar)"} .`)],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun("Los gastos de traslado de los artículos motivo de restitución serán a cargo de EL VENDEDOR.")],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("SIETE. INEXISTENCIA DE RELACIÓN LABORAL. -  Ambos contratantes manifiestan expresamente que no existe relación laboral por la compraventa celebrada. Por lo que, no genera ninguna prestación laboral, ni seguridad social alguno.")],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`OCHO. PENA CONVENCIONAL. - Las partes acuerdan que en el caso de que EL VENDEDOR no entregue ${values.articulosComprar || "(los artículos solicitados)"} en el plazo de ${plazoEntrega} días establecido en la cláusula DOS, o que LA COMPRADORA no pague el total del adeudo pendiente ${values.pagoEsquema === 'anticipo_1' ? condicionSegundoPago : "en tiempo y forma"}, pagará quien incurra en mora el nueve (9%) por ciento sobre el monto establecido como precio de la contraprestación.`)],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("NUEVE. DAÑOS Y PERJUICIOS. -  EL VENDEDOR se hará responsable de los daños y perjuicios que sufra LA COMPRADORA en caso de que no dé cumplimiento al objeto del contrato, o no entregue la mercancía en el plazo establecido.")],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`Para cuantificar el daño deberá tomarse en cuenta los días transcurridos y las consecuencias que ha causado con el retraso de la entrega de ${values.articulosComprar || "(los artículos)"} solicitados por LA COMPRADORA.`)],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("DIEZ. GASTOS DE ENTREGA. - Las partes contratantes han acordado que los gastos de entrega de las cosas vendidas serán a cargo de LA COMPRADORA.")],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("ONCE. VIGENCIA. - Este contrato por común acuerdo de las partes tendrá vigencia de un año, el cual corre a partir de la firma.")],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`DOCE. COMPETENCIA JURISDICCIONAL. - Ambas partes manifiestan que en el caso de que exista controversia sobre la aplicación del presente contrato, se someten a la jurisdicción de las autoridades de la ciudad de ${values.municipioNombre || "_________________________"} .`)]
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`Para constancia de lo estipulado, se firma el presente contrato formándose dos originales, una para cada contratante, ante los testigos C. ${values.testigo1 || "_________________________"} y ${values.testigo2 || "_________________________"}, ambos mayores de edad, mexicanos por nacimiento, vecinos de esta ciudad; declarando ambos conocer personalmente a las partes contratantes, firmándose los dos originales por todas las personas que en el mismo aparecen.`)],
            }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("LA COMPRADORA")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Dra. María Xóchilt Ortega Grillasca")] }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("EL VENDEDOR")] }),
            new Paragraph({ spacing: { after: 400 }, children: [new TextRun(`C. ${values.proveedorNombre}`)] }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("T E S T I G O S")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun(values.testigo1 || "_________________________")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun(values.testigo2 || "_________________________")] }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Contrato_Compraventa_PF.docx");
  };

  const runningRef = useRef(false);
  useEffect(() => {
    if (!autoExportOnValuesChange) return;
    if (runningRef.current) return;
    runningRef.current = true;

    (async () => {
      try {
        await generarDocx();
        onExportDone?.();
      } finally {
        runningRef.current = false;
      }
    })();
  }, [autoExportOnValuesChange, values]);

  if (!autoExportOnValuesChange) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <button onClick={generarDocx} className="bg-blue-600 text-white px-4 py-2 rounded">
        </button>
      </div>
    );
  }

  return null;
}
