'use client';

import { useEffect, useRef } from "react";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

type PSBGPMFormValues = {
  fechaActualISO: string;

  sucursalNombre: string;
  municipioNombre: string;

  proveedorRazonSocial: string;
  representanteLegalNombre: string;
  proveedorRFC: string;
  proveedorDomicilio: string;
  proveedorTipoBien: 'arrendamiento' | 'título de propiedad';
  actividadPreponderante: string;

  escrituraNumero: string;
  volumenNumero: string;
  notarioNombre: string;
  notariaNumero: string;
  estadoNotaria: string;

  tipoPrestacion: 'prestación de servicios' | 'servicio técnico';
  objetoCorto: string;
  objetoLargo: string;
  serviciosIncluidos?: string[];

  importeNumero: number;
  importeLetra: string;
  pagoEsquema: 'pago_unico' | 'anticipo_1' | 'anticipo_2';
  anticipoPct?: number;
  segundoPagoPct?: number;
  fechaSegundoPago?: string;
  fechaTercerPago?: string;
  pagoMedio: 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque';

  fechaEventoISO: string;
  horaAccesoInicio: string;
  horaAccesoFin: string;

  testigo1: string;
  testigo2: string;
};

function fechaLegibleDesdeISO(iso: string) {
  const d = iso ? new Date(iso) : new Date();
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };
  return d.toLocaleDateString("es-MX", opts);
}
function horaLegible(hhmm?: string) {
  if (!hhmm) return "____:____";
  const [h, m] = (hhmm || "").split(":");
  return `${(h || '').padStart(2, "0")}:${(m || '').padStart(2, "0")}`;
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
  values: PSBGPMFormValues;
  autoExportOnValuesChange?: boolean;
  onExportDone?: () => void;
};

export default function ContratoPSBGPM({
  values,
  autoExportOnValuesChange = false,
  onExportDone,
}: Props) {
  const generarDocx = async () => {
    const fechaContrato = fechaLegibleDesdeISO(values.fechaActualISO);
    const fechaEvento = values.fechaEventoISO ? fechaLegibleDesdeISO(values.fechaEventoISO) : "_________________________";

    const pagoMedioMap: Record<PSBGPMFormValues["pagoMedio"], string> = {
      transferencia: "transferencia electrónica",
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
      values.pagoEsquema === "anticipo_1" ? (100 - anticipoPct)
      : values.pagoEsquema === "anticipo_2" ? (values.segundoPagoPct ?? 0)
      : 0;

    const segundoMonto =
      values.pagoEsquema === "anticipo_1" ? (importe - anticipoMonto)
      : values.pagoEsquema === "anticipo_2" ? (importe * segundoPct) / 100
      : 0;

    const terceroPct = values.pagoEsquema === "anticipo_2" ? (100 - anticipoPct - segundoPct) : 0;
    const tercerMonto = values.pagoEsquema === "anticipo_2" ? (importe - anticipoMonto - segundoMonto) : 0;

    const pagoParrafos = (() => {
      if (values.pagoEsquema === "pago_unico") {
        return [
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun(
                `Se pagará en una sola exhibición el 100% del importe acordado como precio del servicio, equivalente a ${mxn(importe)} (${importeLetra}) IVA incluido.`
              ),
            ],
          }),
        ];
      }
      const arr: Paragraph[] = [
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun(
              `A). - A la firma del contrato se cobrará el ${anticipoPct}% del total del importe acordado como precio del servicio, el cual corresponde a ${mxn(anticipoMonto)} (${numeroALetrasMX(anticipoMonto)}) IVA incluido.`
            ),
          ],
        }),
        new Paragraph({
          spacing: { after: values.pagoEsquema === "anticipo_2" ? 200 : 400 },
          children: [
            new TextRun(
              `B). - ${values.fechaSegundoPago || "al día siguiente"} del evento se pagará el ${segundoPct}% pendiente de pago, el cual corresponde a ${mxn(segundoMonto)} (${numeroALetrasMX(segundoMonto)}) IVA incluido.`
            ),
          ],
        }),
      ];
      if (values.pagoEsquema === "anticipo_2") {
        arr.push(
          new Paragraph({
            spacing: { after: 400 },
            children: [
              new TextRun(
                `C). - ${values.fechaTercerPago || "fecha/condición del tercer pago"} se pagará el ${terceroPct}% restante, equivalente a ${mxn(tercerMonto)} (${numeroALetrasMX(tercerMonto)}) IVA incluido.`
              ),
            ],
          })
        );
      }
      return arr;
    })();

    const serviciosIncluidosParrafos: Paragraph[] = [];
    if (values.serviciosIncluidos?.length) {
      values.serviciosIncluidos.forEach((s, i) => {
        serviciosIncluidosParrafos.push(
          new Paragraph({ spacing: { after: 100 }, children: [new TextRun(`${i + 1}.- ${s}`)] })
        );
      });
      serviciosIncluidosParrafos.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun(`(Descripción del servicio. Todos los servicios deberán ser descritos).`)],
        })
      );
    }

    const razonSocial = values.proveedorRazonSocial || "_________________________";
    const repLegal = values.representanteLegalNombre || "_________________________";
    const escrituraNumero = values.escrituraNumero || "__________";
    const volumenNumero = values.volumenNumero || "__________";
    const notarioNombre = values.notarioNombre || "_________________________";
    const notariaNumero = values.notariaNumero || "___";
    const estadoNotaria = values.estadoNotaria || "__________";

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
              children: [new TextRun({ text: "CONTRATO PSB Y G-PM.", bold: true, size: 24 })],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [
                new TextRun(
                  `En la ciudad de Tuxtla Gutiérrez, Chiapas; a ${fechaContrato}, comparecen por una parte, la Universidad Internacional del Conocimiento e Investigación, S. C. a través de su representante legal la Dra. María Xóchilt Ortega Grillasca, quien en lo sucesivo se denominará “LA CONTRATANTE”, y por la otra la empresa denominada ${razonSocial} (proveedor), representado por su apoderado legal el C. ${repLegal} (representante legal del proveedor), quien en lo sucesivo se denominará “EL PRESTADOR DE SERVICIO”; ambas partes manifiestan tener concertado un contrato de prestación de servicios de ${values.objetoCorto || "Banquete de Graduación"}, que formalizan al tenor de las siguientes declaraciones y cláusulas:`
                ),
              ],
            }),

            new Paragraph({ spacing: { after: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DECLARACIONES", bold: true })] }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("A). - DE LA CONTRATANTE:")] }),
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
              children: [new TextRun(`3.- Señala como domicilio para los efectos de este contrato, el ubicado en ${values.sucursalNombre || "_________________________"}; mismo que señala para oír y recibir todo tipo de notificaciones.`)],
            }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("4.- El lugar donde se encuentra su domicilio actual lo tiene en calidad de arrendamiento.")] }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("5.- Que su actividad preponderante es la enseñanza del conocimiento a través de estudios universitarios, en preparatoria, y todas aquellas actividades que tienen como propósito el desarrollo de la capacitación con fines educativos.")],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`6.- Que le es indispensable para cumplir con su objeto social, contratar el servicio de ${values.objetoCorto || "Banquete de Graduación"}${values.objetoLargo ? `, ${values.objetoLargo}` : ""}.`)],
            }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("B). - DEL PRESTADOR DE SERVICIO.")] }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`1.- Manifiesta la empresa denominada ${razonSocial} (proveedor), ser una persona moral constituida conforme a la legislación mexicana, lo cual acredita con el Instrumento Notarial número ${escrituraNumero}, VOLUMEN NÚMERO ${volumenNumero}, expedida por ${notarioNombre}, Notaría Pública número ${notariaNumero} del Estado de ${estadoNotaria}.`)]
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`2.- Que en este acto es representada por el C. ${repLegal} (representante legal del proveedor), en su carácter de representante legal, que lo acredita mediante el instrumento señalado en el numeral anterior, personalidad que no le ha sido revocada o limitada a la fecha de la celebración del presente contrato.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`3.- Que tiene su domicilio fiscal en ${values.proveedorDomicilio || "_________________________"}; el cual lo acredita con su constancia de situación fiscal que exhibe en este momento.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`4.- El lugar donde se encuentra su domicilio actual lo tiene en calidad de ${values.proveedorTipoBien || "arrendamiento o título de propiedad"}.`)],
            }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`5.- ${values.actividadPreponderante || "Ser una empresa que ofrece banquetes para eventos de todo tipo, desde fiestas, eventos institucionales, eventos privados y para empresas; con personal capacitado para abarcar diversos volúmenes de invitados."}`)],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun("6.- Manifiesta que cuenta con personal suficiente con la experiencia y los conocimientos necesarios para prestar el servicio que se solicita, que no existe coacción física, verbal, ni psicológica para comprometerse, y además que no tiene ningún impedimento legal para formalizar el presente contrato.")],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`Con las declaraciones anteriores, las referidas partes han acordado celebrar un contrato de prestación de servicio de ${values.objetoCorto || "Banquete de Graduación"}, el cual se sujeta a las siguientes:`)],
            }),

            new Paragraph({ spacing: { after: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CLAUSULAS", bold: true })] }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`UNO. OBJETO DEL CONTRATO. - La contratante manifiesta que hará la clausura de los alumnos que han cursado el ciclo escolar 2021 – 2024 de la Licenciatura en Contaduría Pública y Licenciatura en Derecho; por lo que requiere DEL PRESTADOR DE SERVICIO el ${values.objetoCorto || "banquete para graduación"}, que deberá incluir lo siguiente:`)],
            }),
            ...serviciosIncluidosParrafos,

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`DOS. DEL PRECIO. - Ambos contratantes han acordado como precio del servicio la cantidad de ${mxn(importe)} (${importeLetra}) IVA incluido. El cual se pagará de la siguiente manera:`)],
            }),
            ...pagoParrafos,

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("TRES. DE LA FACTURA. - El prestador de servicio deberá entregar su CFDI (factura(s)) a nombre de la contratante para que le sea pagado su servicio.")],
            }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("Además, para dar cumplimiento a las leyes fiscales, deberá proporcionar a la contratante la siguiente información y documentación:")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("1.- Constancia de situación fiscal actualizada.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("*Notificar los cambios relacionados con su domicilio fiscal a fin de poder actualizar la base de datos para la emisión de su CFDI.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("2.- Formato 32-D Opinión del cumplimiento de obligaciones fiscales actualizada “con opinión positiva”.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("3.- Opinión del cumplimiento de Obligaciones ante el IMSS e INFONAVIT actualizado “con opinión positiva”.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("4.- Comprobante de domicilio (no mayor a dos meses) que coincida con el que indica la constancia de situación fiscal.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("5.- Acta constitutiva y poder notarial.")] }),
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun("6.- Identificación oficial vigente del representante legal.")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("7.- Carátula de estado de cuenta donde se visualice la clave interbancaria y número de cuenta actualizada (no mayor a dos meses).")] }),
            new Paragraph({ spacing: { after: 400 }, children: [new TextRun("La documentación deberá ser enviada de forma escaneada (no fotos) al correo electrónico facturas@unici.edu.mx.")] }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`CUATRO. EL PAGO. - El pago del servicio se hará a través de ${pagoMedioTxt} previo envío del CFDI (factura). Por el sólo hecho de hacerse la transferencia de pago se tendrá por aceptado el pago por el prestador de servicio, sin más requisito alguno.`)],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`CINCO. DÍA DEL EVENTO. - Ambos acuerdan que el día del evento o entrega será el ${fechaEvento}.`)],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`SEIS. HORARIO DE ACCESO. - El prestador de servicio deberá permitir al personal de la contratante, el acceso del lugar del evento a partir de las ${horaLegible(values.horaAccesoInicio)} hasta las ${horaLegible(values.horaAccesoFin)} horas, para que pueda introducir materiales a utilizar durante el evento, así como retirar aquellos bienes que sean de su propiedad.`)],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("SIETE. INEXISTENCIA DE RELACIÓN LABORAL. -  Ambos contratantes manifiestan expresamente que no existe relación laboral por el servicio que se contrata. Por lo que, no genera ninguna prestación laboral, ni seguridad social alguno.")],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`OCHO. PENA CONVENCIONAL. - Las partes acuerdan que en el caso de que EL PRESTADOR DE SERVICIO no tenga disponible el servicio en el día y hora establecida, o se niegue a dar el servicio de ${values.objetoCorto || "banquete"}; o LA CONTRATANTE no pague el precio del servicio en la fecha acordada, pagará quien incurra en mora el nueve (9%) por ciento sobre el monto establecido como precio de la contraprestación.`)],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun("NUEVE. DAÑOS Y PERJUICIOS. - EL PRESTADOR DE SERVICIO se hará responsable de los daños y perjuicios que sufra LA CONTRATANTE en caso de que no dé cumplimiento al objeto del contrato, ya sea por negligencia, o por dar un bien de menor calidad a la estipulada en la Cláusula Uno denominado Objeto del contrato.")],
            }),
            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun("Para la cuantificación del pago de daños y perjuicio se deberá tomar en cuenta la calidad del servicio o los bienes que fueron objeto del contrato. No será convalidado un servicio de menor calidad a lo pagado, como tampoco lo será si el bien dado no corresponde a lo acordado en el objeto del presente contrato. EL PRESTADOR DE SERVICIO deberá devolver el importe económico equivalente al servicio que dejó de dar, así como de aquellos bienes que no se dieron en la calidad estipulada en el contrato.")],
            }),

            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun(`DIEZ. - Ambas partes manifiestan que en el caso de que exista controversia sobre la aplicación del presente contrato, se someten a la jurisdicción de las autoridades de la ciudad de ${values.municipioNombre || "Tapachula de Córdova y Ordoñez, Chiapas / Tuxtla Gutiérrez, Chiapas"}.`)],
            }),

            new Paragraph({
              spacing: { after: 400 },
              children: [new TextRun(`Para constancia de lo estipulado, se firma el presente contrato formándose dos originales, una para cada contratante, ante los testigos C. ${values.testigo1 || "_________________________"} y ${values.testigo2 || "_________________________"}, ambos mayores de edad, mexicanos por nacimiento, vecinos de esta ciudad; declarando ambos conocer personalmente a las partes contratantes, firmándose los dos originales por todas las personas que en el mismo aparecen.`)],
            }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("CONTRATANTE")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("Dra. María Xóchilt Ortega Grillasca")] }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("PRESTADOR DE SERVICIO")] }),
            new Paragraph({ spacing: { after: 400 }, children: [new TextRun(`C. ${repLegal} (representante legal del proveedor)`)] }),

            new Paragraph({ spacing: { after: 200 }, children: [new TextRun("T E S T I G O S")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun(values.testigo1 || "_________________________")] }),
            new Paragraph({ spacing: { after: 200 }, children: [new TextRun(values.testigo2 || "_________________________")] }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Contrato_PSB_G_PM.docx");
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
          Exportar Contrato
        </button>
      </div>
    );
  }

  return null;
}
