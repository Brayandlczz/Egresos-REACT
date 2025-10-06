export type PagoEsquema = 'pago_unico' | 'anticipo_1' | 'anticipo_2';
export type PagoMedio = 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque';

export type PSBGPMFormValues = {
  fechaActualISO: string;

  sucursalId: string;
  sucursalNombre: string;
  municipioId: string;
  municipioNombre: string;

  proveedorId: string;
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
  pagoEsquema: PagoEsquema;
  anticipoPct?: number;               
  segundoPagoPct?: number;           
  fechaSegundoPago?: string;          
  fechaTercerPago?: string;         
  pagoMedio: PagoMedio;

  fechaEventoISO: string;           
  horaAccesoInicio: string;         
  horaAccesoFin: string;           

  testigo1: string;
  testigo2: string;
};
