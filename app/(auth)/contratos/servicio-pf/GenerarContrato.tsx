'use client';

import { useEffect, useRef } from "react";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import type { PSTPFFormValues } from "@/app/(auth)/contratos/servicio-pf/tipos";

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

function hCenterBold(text: string) {
  return new Paragraph({
    spacing: { after: 400 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, bold: true })],
  });
}
function incisoTitulo(text: string) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text, bold: true })],
  });
}
function clausulaTitulo(textoNumeroYNombre: string) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [new TextRun({ text: textoNumeroYNombre, bold: true })],
  });
}

type Props = {
  values: PSTPFFormValues;
  autoExportOnValuesChange?: boolean;
  onExportDone?: () => void;
};

export default function ContratoPSTPF({
  values,
  autoExportOnValuesChange = false,
  onExportDone,
}: Props) {
  const generarDocx = async () => {
    const fecha = fechaLegibleDesdeISO(values.fechaActualISO);
    const pagoMedioMap: Record<PSTPFFormValues["pagoMedio"], string> = {
      transferencia: "transferencia electrónica a su cuenta bancaria",
      cuenta_bancaria_prestador: "transferencia electrónica a la cuenta bancaria del prestador de servicio",
      efectivo: "pago en efectivo",
      cheque: "pago con cheque",
    };
    const pagoMedioTxt = pagoMedioMap[values.pagoMedio];

    const importe = values.importeNumero || 0;
    const importeLetra = values.importeLetra || numeroALetrasMX(importe);

    const anticipoPct = values.pagoEsquema === "pago_unico" ? 100 : (values.anticipoPct ?? 0);
    const anticipoMonto = values.pagoEsquema === "pago_unico" ? importe : (importe * anticipoPct) / 100;

    const segundoPct =
      values.pagoEsquema === "anticipo_1" ? 100 - anticipoPct
      : values.pagoEsquema === "anticipo_2" ? (values.segundoPagoPct ?? 0)
      : 0;

    const segundoMonto =
      values.pagoEsquema === "anticipo_1" ? importe - anticipoMonto
      : values.pagoEsquema === "anticipo_2" ? (importe * segundoPct) / 100
      : 0;

    const terceroPct = values.pagoEsquema === "anticipo_2" ? 100 - anticipoPct - segundoPct : 0;
    const tercerMonto = values.pagoEsquema === "anticipo_2" ? importe - anticipoMonto - segundoMonto : 0;

    const pagoParrafos = (() => {
      if (values.pagoEsquema === "pago_unico") {
        return [
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({ text: "A). - ", bold: true }),
              new TextRun(
                `A la firma del contrato se cobrará el 100% del total del importe acordado como precio del servicio, el cual corresponde a ${mxn(importe)} (${importeLetra}) IVA incluido.`
              ),
            ],
          }),
        ];
      }
      const base: Paragraph[] = [
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "A). - ", bold: true }),
            new TextRun(
              `A la firma del contrato se cobrará el ${anticipoPct}% del total del importe acordado como precio del servicio, el cual corresponde a ${mxn(anticipoMonto)} (${numeroALetrasMX(anticipoMonto)}) IVA incluido.`
            ),
          ],
        }),
        new Paragraph({
          spacing: { after: values.pagoEsquema === "anticipo_2" ? 200 : 400 },
          children: [
            new TextRun({ text: "B). - ", bold: true }),
            new TextRun(
              `${values.fechaSegundoPago || "a la entrega"} del evento se pagará el ${segundoPct}% pendiente de pago, el cual corresponde a ${mxn(segundoMonto)} (${numeroALetrasMX(segundoMonto)}) IVA incluido.`
            ),
          ],
        }),
      ];
      if (values.pagoEsquema === "anticipo_2") {
        base.push(
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun({ text: "C). - ", bold: true }),
              new TextRun(
                `${values.fechaTercerPago || "fecha/condición del tercer pago"} se pagará el ${terceroPct}% restante, equivalente a ${mxn(tercerMonto)} (${numeroALetrasMX(tercerMonto)}) IVA incluido.`
              ),
            ],
          })
        );
      }
      return base;
    })();

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: "Arial", size: 24 }, paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { line: 276 } } },
        },
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              spacing: { after: 400 },
              alignment: AlignmentType.END,
              children: [new TextRun({ text: "CONTRATO PST PF.", bold: true, size: 24 })],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun(
                  `En la ciudad de Tuxtla Gutiérrez, Chiapas; a ${fecha}, comparecen por una parte la Universidad Internacional del Conocimiento e Investigación, S. C. a través de su representante legal Dra. María Xóchilt Ortega Grillasca, quien en lo sucesivo se denominará la “contratante”, y por la otra la persona física ${values.proveedorNombre}, quien en lo sucesivo se denominará el “prestador de servicio”; ambas partes manifiestan tener concertado un contrato de prestación de ${values.tipoPrestacion} ${values.objetoCorto ? `de ${values.objetoCorto}` : ""} que formalizan al tenor de las siguientes declaraciones y cláusulas:`
                ),
              ],
            }),

            hCenterBold("DECLARACIONES"),

            incisoTitulo("A). - DE LA CONTRATANTE:"),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun(
                  "1.- Que es una persona moral constituida conforme a la legislación mexicana, lo cual acredita con el Instrumento Notarial número CUATRO MIL CUATROCIENTOS CINCUENTA Y DOS, VOLUMEN NÚMERO CINCUENTA Y TRES, expedida por el Lic. Emmanuel Nivón González en calidad de Notario Público número 144, de Tapachula de Córdova y Ordoñez, Chiapas."
                ),
              ],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun(
                  "2.- Que en este acto es representada por la Dra. María Xóchilt Ortega Grillasca, en su carácter de representante legal, lo cual acredita mediante el instrumento señalado en el numeral anterior, personalidad que no le ha sido revocada o limitada a la fecha de la celebración del presente contrato."
                ),
              ],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun(
                  `3.- Que señala como domicilio para los efectos de este contrato, el ubicado en ${values.sucursalNombre}; mismo que señala para oír y recibir todo tipo de notificaciones.`
                ),
              ],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("4.- El lugar donde se encuentra su domicilio actual lo tiene en calidad de arrendamiento.")],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun(
                  "5.- Que su actividad preponderante es la enseñanza del conocimiento a través de estudios universitarios, en preparatoria, y todas aquellas actividades que tienen como propósito el desarrollo de la capacitación con fines educativos."
                ),
              ],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun(
                  `6.- Que le es indispensable para cumplir con su objeto social, contratar el servicio ${values.objetoLargo}`
                ),
              ],
            }),

            incisoTitulo("B). - DEL PRESTADOR DE SERVICIO TÉCNICO."),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun(
                  `1.- Manifiesta la persona física C. ${values.proveedorNombre}, ser una persona física mexicana, lo cual acredita con registro federal de contribuyente ${values.proveedorRFC}, expedida por Secretaría de Hacienda y Crédito Público.`
                ),
              ],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun(
                  `2.- Que en este acto es representada por el C. ${values.proveedorNombre}, en su carácter de representante legal, el que acredita mediante el instrumento señalado en el numeral anterior a la fecha de la celebración del presente contrato.`
                ),
              ],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun(
                  `3.- Que tiene su domicilio fiscal en ${values.proveedorDomicilio}; el cual acredita en este momento a través de su constancia de situación fiscal; mismo que señala para oír y recibir todo tipo de notificaciones.`
                ),
              ],
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
              children: [
                new TextRun(
                  `6.- Manifiesta que cuenta con personal suficiente con la experiencia y los conocimientos necesarios para prestar el servicio que se solicita, que no existe coacción física, verbal, ni psicológica para comprometerse, y además que no tiene ningún impedimento legal para formalizar el presente contrato.`
                ),
              ],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun(
                  `Con las declaraciones anteriores, las referidas partes han acordado celebrar un contrato de prestación de ${values.tipoPrestacion}, el cual se sujeta a las siguientes:`
                ),
              ],
            }),

            hCenterBold("CLÁUSULAS"),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "UNO. OBJETO DEL CONTRATO. - ", bold: true }),
                new TextRun(`La contratante manifiesta que, debido a ${values.objetoCorto}.`),
              ],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "DOS. DEL PRECIO. - ", bold: true }),
                new TextRun(
                  `Ambos contratantes han acordado como precio del servicio la cantidad de ${mxn(importe)} (${importeLetra}). ` +
                  `El cual se pagará de la siguiente manera: ${
                    values.pagoEsquema === "pago_unico"
                      ? "pago único"
                      : values.pagoEsquema === "anticipo_1"
                      ? "anticipo y un pago"
                      : "anticipo y dos pagos"
                  }.`
                ),
              ],
            }),
            ...pagoParrafos,

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "TRES. DE LA FACTURA. - ", bold: true }),
                new TextRun(
                  "El prestador de servicio deberá entregar su CFDI (factura (s)) a nombre de la contratante para que le sea pagado su servicio."
                ),
              ],
            }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Además, para dar cumplimiento a las leyes fiscales, deberá proporcionar a la contratante la siguiente información y documentación:")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("1.- Constancia de situación fiscal actualizada.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("*Notificar los cambios relacionados con su domicilio fiscal a fin de poder actualizar la base de datos para la emisión de su CFDI.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("2.- Formato 32-D Opinión del cumplimiento de obligaciones fiscales actualizado “con opinión positiva”.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("3.- Opinión del cumplimiento de obligaciones ante el IMSS e INFONAVIT actualizada “con opinión positiva”.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("4.- Comprobante de domicilio (no mayor a dos meses) coincidente con el que indica la constancia de situación fiscal.")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("5.- Identificación oficial vigente.")] }),
            new Paragraph({ spacing: { after: 400 }, children: [new TextRun("La documentación deberá ser enviada de forma escaneada (no foto) al correo electrónico facturas@unici.edu.mx")] }),

            new Paragraph({ spacing: { after: 200 }, children: [ new TextRun({ text: "CUATRO. EL PAGO. - ", bold: true }), new TextRun("El pago del servicio se hará a través de transferencia electrónica a su cuenta bancaria previo envío del CFDI. Por el sólo hecho de hacerse la transferencia de pago se tendrá por aceptado el pago por el prestador de servicio, sin más requisito alguno.") ] }),

            new Paragraph({ spacing: { after: 200 }, children: [ new TextRun({ text: "CINCO. MATERIAL DE INSUMO. - ", bold: true }), new TextRun("Se acuerda que sea la contratante quién compre el material de insumo necesario.") ] }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "SEIS. DE LA GARANTÍA. - ", bold: true }),
                new TextRun(
                  `El prestador de servicio ofrece como garantía de su servicio el plazo de ${values.plazoGarantiaDias || 30} días contado a partir de que entregue las instalaciones. Para hacer efectivo la garantía bastará con que la contratante dé aviso por teléfono al prestador de servicio.`
                ),
              ],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "SIETE. PLAZO DE CONCLUSIÓN. - ", bold: true }),
                new TextRun(
                  `Ambos acuerdan que el plazo para la entrega del servicio solicitado sea concluido en ${values.plazoConclusionDias || 15} días naturales contados a partir de la firma del presente contrato.`
                ),
              ],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "OCHO. HORARIO DE ACCESO. - ", bold: true }),
                new TextRun(
                  "El prestador de servicio dispone libremente del horario que así convenga llegar o salir del lugar para llevar a cabo el servicio contratado. Sin embargo, deberá ser dentro del horario que se encuentra laborando la contratante."
                ),
              ],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "NUEVE. INEXISTENCIA DE RELACIÓN LABORAL. - ", bold: true }),
                new TextRun(
                  "Ambos contratantes manifiestan expresamente que no existe relación laboral por el servicio que se contrata. Por lo que, no genera ninguna prestación laboral, ni seguridad social alguno."
                ),
              ],
            }),


            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "DIEZ. PENA CONVENCIONAL. - ", bold: true }),
                new TextRun(
                  `Las partes acuerdan que en el caso de que EL PRESTADOR DE SERVICIO no haga la entrega en el plazo en los ${values.diasPlazoPena || values.plazoConclusionDias || 15} días naturales establecido en la cláusula SIETE, o LA CONTRANTE no pague después de concluido los servicios, pagará por mora el nueve (9%) por ciento sobre el monto establecido como precio de la contraprestación.`
                ),
              ],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "ONCE. DAÑOS Y PERJUICIO. - ", bold: true }),
                new TextRun(
                  `EL PRESTADOR DE SERVICIO se hará responsable de los daños y perjuicios que sufra LA CONTRATANTE en caso de que no dé cumplimiento al objeto del contrato, ya sea por negligencia, o por utilizar un personal que no tenga los conocimientos (${values.objetoCorto}). Siendo a costa del PRESTADOR DE SERVICIO la mano de obra y el material de insumo que se requiera para que la Institución Educativa cumpla con el objetivo solicitado por LA CONTRATANTE.`
                ),
              ],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun(
                  "En caso de que EL PRESTADOR DE SERVICIO no dé cumplimiento con el objeto del contrato, se podrá optar que pague en efectivo los daños y perjuicios ocasionados, previa cuantificación por un tercero con experiencia en la materia."
                ),
              ],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "DOCE. - ", bold: true }),
                new TextRun(
                  `Ambas partes manifiestan que en el caso de que exista controversia sobre la aplicación del presente contrato, en someterse a la jurisdicción de las autoridades de la ciudad de ${values.municipioNombre || "________"}.`
                ),
              ],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun(
                  `Para constancia de lo estipulado, se firma el presente contrato formándose dos originales, una para cada contratante, ante los testigos C. ${values.testigo1 || "_________________________"} y ${values.testigo2 || "_________________________"}, ambos mayores de edad, mexicanos por nacimiento, vecinos de esta ciudad; declarando ambos conocer personalmente a las partes contratantes, firmándose los dos originales por todas las personas que en el mismo aparecen.`
                ),
              ],
            }),

            hCenterBold("FIRMAS"),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 100 }, children: [new TextRun("_____________________________")] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("CONTRATANTE")] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Dra. María Xóchilt Ortega Grillasca")] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 100 }, children: [new TextRun("_____________________________")] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("PRESTADOR DE SERVICIO")] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`C. ${values.proveedorNombre}`)] }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            new Paragraph({ spacing: { before: 400, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TESTIGOS", bold: true })] }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 100 }, children: [new TextRun("_____________________________")] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(values.testigo1 || "_________________________")] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600, after: 100 }, children: [new TextRun("_____________________________")] }),
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(values.testigo2 || "_________________________")] }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Contrato_PST_PF.docx");
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
          Generar DOCX
        </button>
      </div>
    );
  }

  return null;
}
