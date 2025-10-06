export type PagoEsquemaCV = 'pago_unico' | 'anticipo_1';

export type PagoMedio = 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque';

export type TipoBien = 'arrendamiento' | 'título de propiedad';

export interface CompraventaPMFormValues {
  fechaActualISO: string;

  importeNumero?: number;
  importeLetra?: string;

  sucursalId: string;
  sucursalNombre: string;
  municipioId: string;
  municipioNombre: string;

  proveedorId: string;
  proveedorRazonSocial: string;
  representanteLegalNombre: string;
  proveedorRFC: string;
  proveedorDomicilio: string;
  proveedorTipoBien: TipoBien;
  actividadPreponderante: string;

  numeroEscritura: string;
  volumenEscritura: string;
  nombreNotario: string;
  numeroNotaria: string;
  estadoNotaria: string;

  articulosComprar: string;      
  descripcionCompra: string;   

  correoProveedor: string;
  plazoEntregaHoras: number;
  entregaDomicilioSucursal: string;

  pagoEsquema: PagoEsquemaCV;    
  pagoMedio: PagoMedio;
  anticipoPct?: number;
  importeAnticipo?: number;
  condicionSegundoPago?: string;

  plazoGarantiaDias: number;
  diasPlazoPena: number;

  testigo1: string;
  testigo2: string;
}
