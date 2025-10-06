export type PagoEsquema = 'pago_unico' | 'anticipo_1' | 'anticipo_2';
export type PagoMedio = 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque';

export type PSBGPFFormValues = {
  fechaActualISO: string;

  sucursalId: string;
  sucursalNombre: string;
  municipioId: string;
  municipioNombre: string;

  proveedorId: string;
  proveedorNombre: string;
  proveedorRFC: string;
  proveedorDomicilio: string;
  proveedorTipoBien: 'arrendamiento' | 'título de propiedad';
  actividadPreponderante: string;

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
