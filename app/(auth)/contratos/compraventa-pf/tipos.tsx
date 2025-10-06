export type PSTPFFormValuesBase = {
  fechaActualISO: string;

  proveedorId: string;
  proveedorNombre: string;
  proveedorRFC: string;
  proveedorDomicilio: string;
  proveedorTipoBien: 'arrendamiento' | 'título de propiedad';

  sucursalId: string;
  sucursalNombre: string;
  municipioId: string;
  municipioNombre: string;

  actividadPreponderante: string;

  plazoGarantiaDias: number;
  diasPlazoPena: number;

  testigo1: string;
  testigo2: string;

  pagoMedio: 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque';
};

export type CompraventaPFFormValues = PSTPFFormValuesBase & {
  articulosComprar: string;
  descripcionCompra: string;
  correoProveedor: string;
  plazoEntregaDias: number;
  entregaDomicilioSucursal: string;

  pagoEsquema: 'pago_unico' | 'anticipo_1';
  anticipoPct?: number;
  importeAnticipo?: number;
  condicionSegundoPago?: string;
};
