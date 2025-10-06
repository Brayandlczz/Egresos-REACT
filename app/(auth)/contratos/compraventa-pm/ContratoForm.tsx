'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { CompraventaPMFormValues } from '@/app/(auth)/contratos/compraventa-pm/tipos';

function fechaActualLegibleEs(d = new Date()) {
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('es-MX', opts);
}
function mxn(n: number) {
  if (isNaN(n)) return '$0.00';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}
function numeroALetrasMX(n: number): string {
  const enteros = Math.floor(Math.abs(n));
  const centavos = Math.round((Math.abs(n) - enteros) * 100);
  const letrasEnteros = convertirEnteros(enteros);
  const sufijo = ` ${String(centavos).padStart(2, '0')}/100 M.N.`;
  return `${letrasEnteros} PESOS${sufijo}`;
}
const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE','DIEZ','ONCE','DOCE','TRECE','CATORCE','QUINCE','DIECISÉIS','DIECISIETE','DIECIOCHO','DIECINUEVE','VEINTE'];
function decenasALetras(n: number): string {
  if (n <= 20) return UNIDADES[n];
  const d = Math.floor(n / 10); const u = n % 10;
  const N = ['', '', 'VEINTI', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  if (d === 2) return (`VEINTI${u ? UNIDADES[u].toLowerCase() : ''}`).toUpperCase();
  if (u === 0) return N[d];
  return `${N[d]} Y ${UNIDADES[u]}`;
}
function centenasALetras(n: number): string {
  if (n < 100) return decenasALetras(n);
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100), r = n % 100;
  const N = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  return `${N[c]}${r ? ' ' + decenasALetras(r) : ''}`;
}
function convertirEnteros(n: number): string {
  if (n === 0) return 'CERO';
  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1_000);
  const cientos = n % 1_000;
  const partes: string[] = [];
  if (millones) partes.push(millones === 1 ? 'UN MILLÓN' : `${centenasALetras(millones)} MILLONES`);
  if (miles) partes.push(miles === 1 ? 'MIL' : `${centenasALetras(miles)} MIL`);
  if (cientos) partes.push(centenasALetras(cientos));
  return partes.join(' ').replace(/\s+/g, ' ').trim();
}

type Proveedor = { id: string; nombre_proveedor: string; bien_proveido: string; tipo_persona: string; plantel_id: string };
type Sucursal = { id: string; nombre: string; plantel_id: string };
type Municipio = { id: string; nombre: string; sucursal_id: string };

const baseInput = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm ring-0 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition';
const baseLabel = 'block text-sm font-medium text-slate-700';
const section = 'bg-white rounded-2xl border border-slate-200 shadow-sm p-5';
const legend = 'text-base font-semibold text-slate-800';

export default function CompraventaPMForm({
  onSubmit,
}: {
  onSubmit?: (values: CompraventaPMFormValues) => void;
}) {
  const supabase = useMemo(() => createClientComponentClient(), []);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const [form, setForm] = useState({
    sucursalId: '',
    sucursalNombre: '',
    municipioId: '',
    municipioNombre: '',

    proveedorId: '',
    proveedorRazonSocial: '',
    representanteLegalNombre: '',
    proveedorRFC: '',
    proveedorDomicilio: '',
    proveedorTipoBien: '' as '' | 'arrendamiento' | 'título de propiedad',
    actividadPreponderante: '',

    numeroEscritura: '',
    volumenEscritura: '',
    nombreNotario: '',
    numeroNotaria: '',
    estadoNotaria: '',

    articulosComprar: '',
    descripcionCompra: '',

    correoProveedor: '',
    plazoEntregaHoras: '' as string,
    entregaDomicilioSucursal: '',

    pagoMedio: '' as '' | 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque',
    pagoEsquema: 'pago_unico' as 'pago_unico' | 'anticipo_1',
    anticipoPct: '',
    importeAnticipo: '',
    condicionSegundoPago: 'al día siguiente',

    plazoGarantiaDias: '',
    diasPlazoPena: '',
    testigo1: '',
    testigo2: '',
  });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('sucursales')
        .select('id, nombre, plantel_id')
        .order('nombre', { ascending: true });
      if (!error && data) setSucursales(data as Sucursal[]);
    })();
  }, [supabase]);

  useEffect(() => {
    (async () => {
      let query = supabase
        .from('proveedores')
        .select('id, nombre_proveedor, bien_proveido, tipo_persona, plantel_id')
        .eq('tipo_persona', 'Moral')
        .order('nombre_proveedor', { ascending: true });

      const suc = sucursales.find((s) => s.id === form.sucursalId);
      if (suc?.plantel_id) query = query.eq('plantel_id', suc.plantel_id);

      const { data, error } = await query;
      if (!error && data) setProveedores(data as Proveedor[]);
    })();
  }, [supabase, form.sucursalId, sucursales]);

  useEffect(() => {
    if (!form.sucursalId) {
      setMunicipios([]);
      setForm((f) => ({ ...f, municipioId: '', municipioNombre: '', sucursalNombre: '', entregaDomicilioSucursal: '' }));
      return;
    }
    (async () => {
      const suc = sucursales.find((s) => s.id === form.sucursalId);
      const { data, error } = await supabase
        .from('municipios')
        .select('id, nombre, sucursal_id')
        .eq('sucursal_id', form.sucursalId)
        .order('nombre', { ascending: true });
      if (!error && data) {
        setMunicipios(data as Municipio[]);
        const primero = (data as Municipio[])[0];
        setForm((f) => ({
          ...f,
          sucursalNombre: suc?.nombre || '',
          municipioId: primero?.id || '',
          municipioNombre: primero?.nombre || '',
          entregaDomicilioSucursal: suc?.nombre || '',
        }));
      }
    })();
  }, [form.sucursalId, supabase, sucursales]);

  useEffect(() => {
    const p = proveedores.find((x) => x.id === form.proveedorId);
    setForm((f) => ({
      ...f,
      proveedorRazonSocial: p?.nombre_proveedor ?? '',
      actividadPreponderante: p?.bien_proveido ?? '',
    }));
  }, [form.proveedorId, proveedores]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const anticipoPctNum = Math.max(0, Math.min(100, Number(form.anticipoPct || '0')));
  const importeAnticipoNum = Number(form.importeAnticipo || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const suc = sucursales.find((s) => s.id === form.sucursalId);

    const payload: CompraventaPMFormValues = {
      fechaActualISO: new Date().toISOString(),

      sucursalId: form.sucursalId,
      sucursalNombre: suc?.nombre || '',
      municipioId: form.municipioId,
      municipioNombre: form.municipioNombre,

      proveedorId: form.proveedorId,
      proveedorRazonSocial: form.proveedorRazonSocial.trim(),
      representanteLegalNombre: form.representanteLegalNombre.trim(),
      proveedorRFC: form.proveedorRFC.trim(),
      proveedorDomicilio: form.proveedorDomicilio.trim(),
      proveedorTipoBien: (form.proveedorTipoBien || 'arrendamiento') as 'arrendamiento' | 'título de propiedad',
      actividadPreponderante: form.actividadPreponderante.trim(),

      numeroEscritura: form.numeroEscritura.trim(),
      volumenEscritura: form.volumenEscritura.trim(),
      nombreNotario: form.nombreNotario.trim(),
      numeroNotaria: form.numeroNotaria.trim(),
      estadoNotaria: form.estadoNotaria.trim(),

      articulosComprar: form.articulosComprar.trim(),
      descripcionCompra: form.descripcionCompra.trim(),

      correoProveedor: form.correoProveedor.trim(),
      plazoEntregaHoras: Number(form.plazoEntregaHoras || '0'),
      entregaDomicilioSucursal: form.entregaDomicilioSucursal.trim() || (suc?.nombre || ''),

      pagoEsquema: form.pagoEsquema,
      pagoMedio: (form.pagoMedio || 'transferencia') as 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque',
      anticipoPct: form.pagoEsquema === 'anticipo_1' ? anticipoPctNum : undefined,
      importeAnticipo: form.pagoEsquema === 'anticipo_1' && importeAnticipoNum > 0 ? importeAnticipoNum : undefined,
      condicionSegundoPago: form.pagoEsquema === 'anticipo_1' ? (form.condicionSegundoPago || 'al día siguiente') : undefined,

      plazoGarantiaDias: Number(form.plazoGarantiaDias || '0'),
      diasPlazoPena: Number(form.diasPlazoPena || '0'),

      testigo1: form.testigo1.trim(),
      testigo2: form.testigo2.trim(),
    };

    onSubmit?.(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Contrato de Compraventa · Persona Moral</h1>
        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <strong>Fecha:</strong> {fechaActualLegibleEs()}
        </div>
      </header>

      <section className={section}>
        <h2 className={legend}>A) Sucursal & Municipio</h2>
        <p className="text-sm text-slate-500 mb-4">Selecciona primero la sucursal; el municipio se llenará automáticamente.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={baseLabel}>Sucursal UNICI <span className="text-red-500">*</span></label>
            <select name="sucursalId" value={form.sucursalId} onChange={onChange} className={baseInput} required>
              <option value="">Seleccionar sucursal…</option>
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className={baseLabel}>Municipio</label>
            <input className={`${baseInput} bg-slate-50 text-slate-600 cursor-not-allowed`} value={form.municipioNombre || ''} readOnly placeholder="Se establecerá automáticamente" />
            <input type="hidden" name="municipioId" value={form.municipioId} />
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>B) Vendedor (Persona Moral)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={baseLabel}>Proveedor / Vendedor</label>
            <select name="proveedorId" value={form.proveedorId} onChange={onChange} className={baseInput} disabled={!form.sucursalId}>
              <option value="">{form.sucursalId ? 'Selecciona proveedor…' : 'Elige primero una sucursal'}</option>
              {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre_proveedor}</option>)}
            </select>
          </div>

          <div>
            <label className={baseLabel}>Razón social <span className="text-red-500">*</span></label>
            <input name="proveedorRazonSocial" value={form.proveedorRazonSocial} readOnly className={`${baseInput} bg-slate-50 text-slate-600 cursor-not-allowed`} placeholder="Se completa al elegir proveedor" required />
          </div>

          <div>
            <label className={baseLabel}>RFC del proveedor <span className="text-red-500">*</span></label>
            <input name="proveedorRFC" value={form.proveedorRFC} onChange={onChange} className={baseInput} placeholder="p. ej. LVI920101AB3" required />
          </div>

          <div className="md:col-span-2">
            <label className={baseLabel}>Domicilio fiscal del proveedor <span className="text-red-500">*</span></label>
            <input name="proveedorDomicilio" value={form.proveedorDomicilio} onChange={onChange} className={baseInput} placeholder="Calle, número, colonia, ciudad, estado, CP" required />
          </div>

          <div>
            <label className={baseLabel}>Tipo de bien del domicilio <span className="text-red-500">*</span></label>
            <select name="proveedorTipoBien" value={form.proveedorTipoBien} onChange={onChange} className={baseInput} required>
              <option value="">Selecciona…</option>
              <option value="arrendamiento">Arrendamiento</option>
              <option value="título de propiedad">Título de propiedad</option>
            </select>
          </div>

          <div>
            <label className={baseLabel}>Representante legal <span className="text-red-500">*</span></label>
            <input name="representanteLegalNombre" value={form.representanteLegalNombre} onChange={onChange} className={baseInput} placeholder="p. ej. Juan Manuel Estrada Solís" required />
          </div>

          <div className="md:col-span-2">
            <label className={baseLabel}>Actividad preponderante</label>
            <textarea name="actividadPreponderante" value={form.actividadPreponderante} readOnly rows={2} className={`${baseInput} bg-slate-50 text-slate-600 cursor-not-allowed`} placeholder="Se completa al elegir proveedor (de 'bien_proveido')" />
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>C) Datos notariales del proveedor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={baseLabel}>Número de escritura <span className="text-red-500">*</span></label>
            <input name="numeroEscritura" value={form.numeroEscritura} onChange={onChange} className={baseInput} placeholder="p. ej. 2500" required />
          </div>
          <div>
            <label className={baseLabel}>Volumen de la escritura <span className="text-red-500">*</span></label>
            <input name="volumenEscritura" value={form.volumenEscritura} onChange={onChange} className={baseInput} placeholder="p. ej. 82" required />
          </div>
          <div>
            <label className={baseLabel}>Número de notaría <span className="text-red-500">*</span></label>
            <input name="numeroNotaria" value={form.numeroNotaria} onChange={onChange} className={baseInput} placeholder="p. ej. 169" required />
          </div>
          <div className="md:col-span-2">
            <label className={baseLabel}>Nombre del notario(a) <span className="text-red-500">*</span></label>
            <input name="nombreNotario" value={form.nombreNotario} onChange={onChange} className={baseInput} placeholder="p. ej. Lic. Guadalupe Gómez Casanova" required />
          </div>
          <div>
            <label className={baseLabel}>Estado de la notaría <span className="text-red-500">*</span></label>
            <input name="estadoNotaria" value={form.estadoNotaria} onChange={onChange} className={baseInput} placeholder="p. ej. Chiapas" required />
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>D) Pedido y productos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={baseLabel}>Artículos a comprar (breve) <span className="text-red-500">*</span></label>
            <input name="articulosComprar" value={form.articulosComprar} onChange={onChange} className={baseInput} placeholder="p. ej. souvenirs" required />
          </div>
          <div className="md:col-span-2">
            <label className={baseLabel}>Descripción general de la compra</label>
            <textarea name="descripcionCompra" value={form.descripcionCompra} onChange={onChange} rows={3} className={baseInput} placeholder="Detalles, especificaciones, marcas, modelos, etc." />
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>E) Entrega & contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className={baseLabel}>Domicilio de entrega (sucursal) <span className="text-red-500">*</span></label>
            <input name="entregaDomicilioSucursal" value={form.entregaDomicilioSucursal} onChange={onChange} className={baseInput} placeholder="Se prellena con la sucursal elegida" required />
          </div>
          <div>
            <label className={baseLabel}>Plazo de entrega (horas) <span className="text-red-500">*</span></label>
            <input name="plazoEntregaHoras" type="number" min={1} value={form.plazoEntregaHoras} onChange={onChange} className={baseInput} placeholder="p. ej. 5" required />
          </div>
          <div className="md:col-span-3">
            <label className={baseLabel}>Correo del proveedor <span className="text-red-500">*</span></label>
            <input name="correoProveedor" type="email" value={form.correoProveedor} onChange={onChange} className={baseInput} placeholder="p. ej. jms.pintura@gmail.com" required />
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>F) Pagos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={baseLabel}>Esquema de pago</label>
            <select name="pagoEsquema" value={form.pagoEsquema} onChange={onChange} className={baseInput}>
              <option value="pago_unico">Pago único (total)</option>
              <option value="anticipo_1">Anticipo + 1 pago</option>
            </select>
          </div>
          <div>
            <label className={baseLabel}>Medio de pago <span className="text-red-500">*</span></label>
            <select name="pagoMedio" value={form.pagoMedio} onChange={onChange} className={baseInput} required>
              <option value="">Selecciona…</option>
              <option value="transferencia">Transferencia electrónica</option>
              <option value="cuenta_bancaria_prestador">Cuenta bancaria del proveedor</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>

        {form.pagoEsquema === 'anticipo_1' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            <div>
              <label className={baseLabel}>% Anticipo</label>
              <input name="anticipoPct" type="number" min={1} max={99} value={form.anticipoPct} onChange={onChange} className={baseInput} placeholder="p. ej. 50" />
            </div>
            <div>
              <label className={baseLabel}>Importe del anticipo (opcional)</label>
              <input name="importeAnticipo" type="number" min={0} value={form.importeAnticipo} onChange={onChange} className={baseInput} placeholder="p. ej. 27500" />
              {Number(form.importeAnticipo || '0') > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  En letra: <strong>{numeroALetrasMX(Number(form.importeAnticipo || '0'))}</strong>
                </p>
              )}
            </div>
            <div>
              <label className={baseLabel}>Condición 2º pago</label>
              <input name="condicionSegundoPago" value={form.condicionSegundoPago} onChange={onChange} className={baseInput} placeholder="p. ej. mismo día / al día siguiente / a la entrega" />
            </div>
          </div>
        )}
      </section>

      <section className={section}>
        <h2 className={legend}>G) Garantía, pena y testigos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={baseLabel}>Plazo de garantía (días)</label>
            <input name="plazoGarantiaDias" type="number" min={1} value={form.plazoGarantiaDias} onChange={onChange} className={baseInput} placeholder="p. ej. 30" />
          </div>
          <div>
            <label className={baseLabel}>Días para pena convencional</label>
            <input name="diasPlazoPena" type="number" min={1} value={form.diasPlazoPena} onChange={onChange} className={baseInput} placeholder="p. ej. 7" />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={baseLabel}>Testigo 1</label>
              <input name="testigo1" value={form.testigo1} onChange={onChange} className={baseInput} placeholder="p. ej. Johana Alavez Rodríguez" />
            </div>
            <div>
              <label className={baseLabel}>Testigo 2</label>
              <input name="testigo2" value={form.testigo2} onChange={onChange} className={baseInput} placeholder="p. ej. Ana Oasis Tamayo" />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-white font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        >
          Continuar / Usar en DOCX
        </button>
        <span className="text-sm text-slate-500">(El DOCX usará este payload.)</span>
      </div>

      <details className="mt-2 overflow-hidden rounded-2xl border border-slate-200">
        <summary className="cursor-pointer select-none bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          Vista rápida (anticipo)
        </summary>
        <div className="px-4 py-3 text-sm space-y-1">
          {form.pagoEsquema === 'pago_unico' && <div>Pago único del total del pedido (según lista del vendedor).</div>}
          {form.pagoEsquema === 'anticipo_1' && (
            <>
              <div>
                Anticipo: <strong>{anticipoPctNum}%</strong>
                {Number(form.importeAnticipo || '0') > 0 ? ` — ${mxn(importeAnticipoNum)} (${numeroALetrasMX(importeAnticipoNum)})` : ''}
              </div>
              <div>2º pago: <strong>{form.condicionSegundoPago || 'al día siguiente'}</strong></div>
            </>
          )}
        </div>
      </details>
    </form>
  );
}
