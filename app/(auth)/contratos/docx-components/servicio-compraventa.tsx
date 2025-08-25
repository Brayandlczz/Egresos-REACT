'use client';

import React from 'react';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export default function GenerarContratoPSB() {

  const generarContrato = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [

            new Paragraph({
              text: "CONTRATO PSB Y G",
              heading: "Heading1",
              spacing: { after: 300 },
            }),

            new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
              children: [
                new TextRun("En la ciudad de Tuxtla Gutiérrez, Chiapas; a 03 de junio de 2024 (fecha), comparecen por una parte, la Universidad Internacional del Conocimiento e Investigación, S. C. a través de su representante legal la Dra. María Xóchilt Ortega Grillasca, quien en lo sucesivo se denominará la “contratante”, y por la otra la empresa denominada La Virtuosa, S.A. de C.V.(proveedor), representado por su apoderado legal  el C. Juan Manuel Estrada Solís (representante legal del proveedor), quien en lo sucesivo se denominará el “prestador de servicio”; ambas partes manifiestan tener concertado un contrato de prestación de servicios de Banquete de Graduación (objeto corto del contrato), que formalizan al tenor de las siguientes declaraciones y cláusulas: "),
              ],
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "DECLARACIONES",
              heading: "Heading2",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "A). - DE LA CONTRATANTE:",
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "1.- Que es una persona moral constituida conforme a la legislación mexicana, lo cual acredita con el Instrumento Notarial número CUATRO MIL CUATROCIENTOS CINCUENTA Y DOS, VOLUMEN NÚMERO CINCUENTA Y TRES, expedida por el Lic. Emmanuel Nivón González en calidad de Notario Público número 144, de Tapachula de Córdova y Ordoñez, Chiapas.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "2.- Que en este acto es representada por la Dra. María Xóchilt Ortega Grillasca, en su carácter de representante legal, lo cual acredita mediante el instrumento señalado en el numeral anterior, personalidad que no le ha sido revocada o limitada a la fecha de la celebración del presente contrato.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "3.- Señala como domicilio para los efectos de este contrato, el ubicado en Tercera Avenida Norte, número 99, piso 1, en la localidad de Tapachula de Córdova y Ordoñez, Chiapas; código postal 30700 (sucursal UNICI, opción de seleccionar uno de los dos domicilios de UNICI); mismo que señala para oír y recibir todo tipo de notificaciones.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "4.- El lugar donde se encuentra su domicilio actual lo tiene en calidad de arrendamiento.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "5.- Que su actividad preponderante es la enseñanza del conocimiento a través de estudios universitarios, en preparatoria, y todas aquellas actividades que tienen como propósito el desarrollo de la capacitación con fines educativos.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "6.- Que le es indispensable para cumplir con su objeto social, contratar el servicio de Banquete de Graduación, debido que hará la clausura de los alumnos que han cumplido el ciclo escolar 2021 – 2024 de la licenciatura en Contaduría Pública, Licenciatura en Derecho. (objeto completo del contrato)",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "7.- Manifiesta tener solvencia económica, que no existe coacción física, verbal, ni psicológica para comprometerse, y además que no tiene ningún impedimento legal para formalizar el presente contrato.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "B). - DEL PRESTADOR DE SERVICIO.",
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "1.- Manifiesta la empresa denominada La Virtuosa, S.A. de C.V. (proveedor), ser una persona moral constituida conforme a la legislación mexicana, lo cual acredita con el Instrumento Notarial número DOS MIL QUINIENTOS, VOLUMEN NÚMERO OCHENTA Y DOS, expedida por la Lic. Guadalupe Gómez Casanova, Notaria Pública número 169 del Estado de Chiapas.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "2.- Que en este acto es representada por el C. Juan Manuel Estrada Solís (representante legal del proveedor), en su carácter de representante legal, que lo acredita mediante el instrumento señalado en el numeral anterior, personalidad que no le ha sido revocada o limitada a la fecha de la celebración del presente contrato.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "3.- Que tiene su domicilio fiscal en la 5ª norte poniente número 139, Colonia Centro, de Tuxtla Gutiérrez, Chiapas (domicilio del proveedor); el cual lo acredita con su constancia de situación fiscal que exhibe en este momento.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "4.- El lugar donde se encuentra su domicilio actual lo tiene en calidad de arrendamiento o título de propiedad (tipo de bien del proveedor, opción de seleccionar entre las dos opciones).",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "5.- Ser una empresa que ofrece banquetes para eventos de todo tipo, desde fiestas, eventos institucionales, eventos privados y para empresas. Que su personal está capacitado para poder abarcar un gran número de invitados, así como eventos masivos y también para reuniones personales.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "6.- Manifiesta que cuenta con personal suficiente con la experiencia y los conocimientos necesarios para prestar el servicio que se solicita, que no existe coacción física, verbal, ni psicológica para comprometerse, y además que no tiene ningún impedimento legal para formalizar el presente contrato.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "Con las declaraciones anteriores, las referidas partes han acordado celebrar un contrato de prestación de servicio de Banquete para Graduación (objeto corto del contrato), el cual se sujeta a las siguientes:",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "CLAUSULAS",
              heading: "Heading2",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "UNO. OBJETO DEL CONTRATO. - La contratante manifiesta que hará la clausura de los alumnos que han cursado el ciclo escolar 2021 – 2024 de la licenciatura en Contaduría Pública y Licenciatura en Derecho (motivo de la contratación del servicio); por lo que requiere DEL PRESTADOR DE SERVICIO el banquete para graduación (objeto corto del contrato), que deberá incluir lo siguiente:",
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "1.- Servicios de bebida y comida",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "2.- Elemento complementario de decoración",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "3.- Medios visuales",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "4.- Ambientación",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "5.- Iluminación",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "6.- Montaje",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "7.- Servicios complementarios como personal de servicio, vajillas.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "(descripción del servicio “Todos los servicios deberán ser descritos”)",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "DOS. DEL PRECIO. - Ambos contratantes han acordado como precio del servicio la cantidad de $55,000.00 (importe en número) (Cincuenta y cinco mil pesos 00/100 M. N.) (importe en letra) IVA incluido. El cual se pagará de la siguiente manera: (seleccionar las opciones pago único, anticipo y pago, anticipo y 2 pagos, etc.)",
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "A). - A la firma del contrato se cobrará el 50% (porcentaje de anticipo) (del total del importe acordado como precio del servicio, el cual corresponde a $27,500.00 (importe del anticipo) (Veintisiete mil quinientos pesos, 00/100 m.n.) (importe en letra del anticipo) IVA incluido.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "B). - Al día siguiente (fecha de segundo pago) del evento se pagará el otro 50% (porcentaje de anticipo) pendiente de pago, el cual corresponde a $27,500.00 (porcentaje de anticipo) (Veintisiete mil quinientos pesos, 00/100 m.n.) (importe en letra del anticipo) IVA incluido.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "TRES. DE LA FACTURA. - El prestador de servicio deberá entregar su CFDI (factura(s)) a nombre de la contratante para que le sea pagado su servicio.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "Además, para dar cumplimiento a las leyes fiscales, deberá proporcionar a la contratante la siguiente información y documentación:",
              spacing: { after: 100 },
            }),

            new Paragraph({
              text: "En el caso de que el prestador de servicio sea persona física:",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "1.- Constancia de situación fiscal actualizada.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "*Notificar los cambios relacionados con su domicilio fiscal a fin de poder actualizar la base de datos para la emisión de su CFDI.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "2.- Formato 32-D Opinión del cumplimiento de obligaciones fiscales actualizado “con opinión positiva”.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "3.- Opinión del cumplimiento de obligaciones ante el IMSS e INFONAVIT actualizada “con opinión positiva”.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "4.- Comprobante de domicilio (no mayor a dos meses) coincidente con el que indica la constancia de situación fiscal.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "5.- Identificación oficial vigente.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "6.- Carátula de estado de cuenta donde se visualice la clave interbancaria y número de cuenta actualizada (no mayor a dos meses)",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "En el caso de que el prestador de servicio sea persona moral:",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "1.- Constancia de situación fiscal actualizada.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "*Notificar los cambios relacionados con su domicilio fiscal a fin de poder actualizar la base de datos para la emisión de su CFDI.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "2.- Formato 32-D Opinión del cumplimiento de obligaciones fiscales actualizada “con opinión positiva”.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "3.- Opinión del cumplimiento de Obligaciones ante el IMSS e INFONAVIT actualizado “con opinión positiva”.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "4.- Comprobante de domicilio (no mayor a dos meses) que coincida con el que indica la constancia de situación fiscal.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "5.- Acta constitutiva y poder notarial.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "6.- Identificación oficial vigente del representante Legal.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "7.- Carátula de estado de cuenta donde se visualice la clave interbancaria y número de cuenta actualizada (no mayor a dos meses).",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "La documentación deberá ser enviada de forma escaneada (no fotos) al correo electrónico facturas@unici.edu.mx.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "CUATRO. EL PAGO. - El pago del servicio se hará a través de transferencia electrónica a su cuenta bancaria del prestador de servicio o pago en efectivo o cheque (opción de seleccionar una opción) previo envío del CFDI (factura). Por el sólo hecho de hacerse la transferencia de pago se tendrá por aceptado el pago por el prestador de servicio, sin más requisito alguno.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "CINCO. DÍA DEL EVENTO. - Ambos acuerdan que el día del evento o entrega será el 05 de julio de 2024 (fecha del evento o entrega)",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "SEIS. HORARIO DE ACCESO. - El prestador de servicio deberá permitir al personal de la contratante, el acceso del lugar del evento a partir de las 8:00 hasta las 23:00 (indicar hora de entrada y salida) horas, para que pueda introducir materiales que será utilizando durante el evento, así como para que pueda retirar aquellos bienes que sean de su propiedad.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "SIETE. INEXISTENCIA DE RELACIÓN LABORAL. -  Ambos contratantes manifiestan expresamente que no existe relación laboral por el servicio que se contrata. Por lo que, no genera ninguna prestación laboral, ni seguridad social alguno.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "OCHO. PENA CONVENCIONAL. - Las partes acuerdan que en el caso de que EL PRESTADOR DE SERVICIO no tenga disponible el servicio en el día y hora establecida, o se niegue a dar el servicio de banquete (objetivo corto); o LA CONTRANTE no pague el precio del servicio en la fecha acordada, pagará quién incurra en mora el nueve (9%) por ciento sobre el monto establecido como precio de la contraprestación.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "NUEVE. DAÑOS Y PERJUICIO. - EL PRESTADOR DE SERVICIO se hará responsable de los daños y perjuicios que sufra LA CONTRATANTE en caso de que no dé cumplimiento al objeto del contrato, ya sea por negligencia, o por dar un bien de menos calidad a la estipulada en la Cláusula Uno denominado Objeto del contrato.",
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: "Para la cuantificación del pago de daños y perjuicio se deberá tomar en cuenta la calidad del servicio o los bienes que fue objeto de contrato. No será convalidado un servicio que se haya dado en menor calidad a lo pagado, como tampoco lo será si el bien dado no corresponde a lo acordado en el objeto del presente contrato. Por lo que, EL PRESTADO DE SERVICIO deberá devolver el importe económico equivalente al servicio que dejó de dar, así como de aquellos bienes que no se dieron en la calidad estipulada en el contrato.",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "DIEZ: Ambas partes manifiestan que en el caso de que exista controversia sobre la aplicación del presente contrato, en someterse a la jurisdicción de las autoridades de la ciudad de Tapachula de Córdova y Ordoñez, Chiapas / Tuxtla Gutiérrez, Chiapas. (Opción de seleccionar municipio)",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "Para constancia de lo estipulado, se firma el presente contrato formándose dos originales, una para cada contratante, ante los testigos C. Johana Álvarez Rodríguez y Ana Oasis Tamayo ingresar el nombre de dos testigos de manera manual), ambos mayores de edad, mexicanos por nacimiento, vecinos de esta ciudad; declarando ambos conocer personalmente a las partes contratantes, firmándose los dos originales por todas las personas que en el mismo aparecen.",
              spacing: { after: 500 },
            }),

            new Paragraph({
              text: "CONTRATANTE",
              spacing: { after: 200 },
            }),

            new Paragraph({
              text: "Dra. María Xóchilt Ortega Grillasca\tPRESTADOR DE SERVICIO",
              spacing: { after: 500 },
            }),

            new Paragraph({
              text: "C. Juan Manuel Estrada Solís (representante legal del proveedor)",
              spacing: { after: 500 },
            }),

            new Paragraph({
              text: "T E S T I G O S",
              spacing: { after: 300 },
            }),

            new Paragraph({
              text: "Johana Alavez Rodríguez\t\tAna Oasis Tamayo (nombre de los testigos)",
            }),

          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);

    saveAs(blob, "CONTRATO_PSB_Y_G.docx");
  };

  return (
    <div className="p-6">
      <button
        onClick={generarContrato}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Generar Contrato PSB Y G
      </button>
    </div>
  );
}
