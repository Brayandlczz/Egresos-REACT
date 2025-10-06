export type PSTPMFormValues = {
  fechaActualISO: string;

  proveedorId: string;
  proveedorNombre: string; 
  proveedorRFC: string;
  proveedorDomicilio: string;
  proveedorTipoBien: 'arrendamiento' | 'título de propiedad';

  numeroEscritura: string;
  volumenEscritura: string;
  nombreNotario: string;
  numeroNotaria: string;
  estadoNotaria: string;

  representanteNombre: string;

  sucursalId: string;
  sucursalNombre: string;
  municipioId: string;
  municipioNombre: string;

  tipoPrestacion: 'servicio técnico' | 'prestación de servicios';
  objetoCorto: string;
  objetoLargo: string;
  actividadPreponderante: string;

  importeNumero: number;
  importeLetra: string;
  pagoEsquema: 'pago_unico' | 'anticipo_1' | 'anticipo_2';
  anticipoPct?: number;
  segundoPagoPct?: number;
  fechaSegundoPago?: string;
  fechaTercerPago?: string;

  pagoMedio: 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque';

  plazoGarantiaDias: number;
  plazoConclusionDias: number;
  diasPlazoPena: number;

  testigo1: string;
  testigo2: string;
};
