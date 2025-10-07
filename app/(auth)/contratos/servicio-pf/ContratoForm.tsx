'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { PSTPFFormValues } from "@/app/(auth)/contratos/servicio-pf/tipos";

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
const UNIDADES = [
  '', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE',
];
function decenasALetras(n: number): string {
  if (n <= 20) return UNIDADES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  const N = ['', '', 'VEINTI', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  if (d === 2) return (`VEINTI${u ? UNIDADES[u].toLowerCase() : ''}`).toUpperCase();
  if (u === 0) return N[d];
  return `${N[d]} Y ${UNIDADES[u]}`;
}
function centenasALetras(n: number): string {
  if (n < 100) return decenasALetras(n);
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100);
  const r = n % 100;
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

function normalizeDateLocal(dateStr: string) {
  if (!dateStr) return '';
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? `${dateStr}T00:00:00` : dateStr;
}

type Proveedor = {
  id: string;
  nombre_proveedor: string;
  bien_proveido: string;
  tipo_persona: string;
  plantel_id: string;
  rfc?: string;
};
type Sucursal = { id: string; nombre: string; plantel_id: string };
type Municipio = { id: string; nombre: string; sucursal_id: string };

const baseInput =
  'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm ring-0 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition';
const baseLabel = 'block text-sm font-medium text-slate-700';
const section = 'bg-white rounded-2xl border border-slate-200 shadow-sm p-5';
const legend = 'text-base font-semibold text-slate-800';

const initialFormState = {
  fechaActualISO: '',

  proveedorId: '',
  proveedorNombre: '',
  proveedorRFC: '',
  proveedorDomicilio: '',
  proveedorTipoBien: '' as '' | 'arrendamiento' | 'título de propiedad',

  sucursalId: '',
  municipioId: '',
  municipioNombre: '',

  tipoPrestacion: '' as '' | 'servicio técnico' | 'prestación de servicios',
  objetoCorto: '',
  objetoLargo: '',
  actividadPreponderante: '',

  importeNumero: '' as string,
  pagoEsquema: 'pago_unico' as 'pago_unico' | 'anticipo_1' | 'anticipo_2',
  anticipoPct: '',
  segundoPagoPct: '',
  fechaSegundoPago: '',
  fechaTercerPago: '',

  pagoMedio: '' as '' | 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque',

  plazoGarantiaDias: '',
  plazoConclusionDias: '',
  diasPlazoPena: '',

  testigo1: '',
  testigo2: '',
};

export default function PSTPFForm({
  onSubmit,
}: {
  onSubmit?: (values: PSTPFFormValues) => void;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const [form, setForm] = useState({ ...initialFormState });

  const resetForm = () => {
    setForm({ ...initialFormState });
    setMunicipios([]);
  };

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
        .select('id, nombre_proveedor, bien_proveido, tipo_persona, plantel_id, rfc')
        .eq('tipo_persona', 'Física')
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
      setForm((f) => ({ ...f, municipioId: '', municipioNombre: '' }));
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('municipios')
        .select('id, nombre, sucursal_id')
        .eq('sucursal_id', form.sucursalId)
        .order('nombre', { ascending: true });
      if (!error && data) {
        setMunicipios(data as Municipio[]);
        const primero = (data as Municipio[])[0];
        if (primero) {
          setForm((f) => ({
            ...f,
            municipioId: primero.id,
            municipioNombre: primero.nombre,
          }));
        }
      }
    })();
  }, [form.sucursalId, supabase]);

  useEffect(() => {
    const p = proveedores.find((x) => x.id === form.proveedorId);
    setForm((f) => ({
      ...f,
      proveedorNombre: p?.nombre_proveedor ?? '',
      actividadPreponderante: p?.bien_proveido ?? '',
      proveedorRFC: p?.rfc ?? '',
    }));
  }, [form.proveedorId, proveedores]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const importe = Number(form.importeNumero || '0');
  const importeLetra = numeroALetrasMX(importe);

  const anticipoPctNum = Math.max(0, Math.min(100, Number(form.anticipoPct || '0')));
  const segundoPagoPctNum = Math.max(0, Math.min(100, Number(form.segundoPagoPct || '0')));

  const anticipoMonto =
    form.pagoEsquema === 'pago_unico' ? importe : (importe * (anticipoPctNum / 100));
  const segundoPagoMonto =
    form.pagoEsquema === 'anticipo_1' ? (importe - anticipoMonto)
      : form.pagoEsquema === 'anticipo_2' ? (importe * (segundoPagoPctNum / 100))
      : 0;
  const tercerPagoMonto =
    form.pagoEsquema === 'anticipo_2' ? (importe - anticipoMonto - segundoPagoMonto) : 0;
  const restantePct =
    form.pagoEsquema === 'anticipo_2' ? (100 - anticipoPctNum - segundoPagoPctNum) : (100 - anticipoPctNum);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const suc = sucursales.find((s) => s.id === form.sucursalId);

    const payload: PSTPFFormValues = {
      fechaActualISO: normalizeDateLocal(form.fechaActualISO),

      proveedorId: form.proveedorId,
      proveedorNombre: form.proveedorNombre.trim(),
      proveedorRFC: form.proveedorRFC.trim(),
      proveedorDomicilio: form.proveedorDomicilio.trim(),
      proveedorTipoBien: (form.proveedorTipoBien || 'arrendamiento') as 'arrendamiento' | 'título de propiedad',

      sucursalId: form.sucursalId,
      sucursalNombre: suc?.nombre || '',
      municipioId: form.municipioId,
      municipioNombre: form.municipioNombre,

      tipoPrestacion: (form.tipoPrestacion || 'servicio técnico') as 'servicio técnico' | 'prestación de servicios',
      objetoCorto: form.objetoCorto.trim(),
      objetoLargo: form.objetoLargo.trim(),
      actividadPreponderante: form.actividadPreponderante.trim(),

      importeNumero: isNaN(importe) ? 0 : importe,
      importeLetra,

      pagoEsquema: form.pagoEsquema,
      anticipoPct: form.pagoEsquema === 'pago_unico' ? 100 : anticipoPctNum,
      segundoPagoPct: form.pagoEsquema === 'anticipo_2' ? segundoPagoPctNum : undefined,
      fechaSegundoPago: form.pagoEsquema !== 'pago_unico' ? form.fechaSegundoPago : undefined,
      fechaTercerPago: form.pagoEsquema === 'anticipo_2' ? form.fechaTercerPago : undefined,

      pagoMedio: (form.pagoMedio || 'transferencia') as 'transferencia' | 'cuenta_bancaria_prestador' | 'efectivo' | 'cheque',

      plazoGarantiaDias: Number(form.plazoGarantiaDias || '0'),
      plazoConclusionDias: Number(form.plazoConclusionDias || '0'),
      diasPlazoPena: Number(form.diasPlazoPena || '0'),

      testigo1: form.testigo1.trim(),
      testigo2: form.testigo2.trim(),
    };

    onSubmit?.(payload);
    resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-2.5 py-2 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            aria-label="Volver"
            title="Volver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-slate-800">Contrato de Servicio · Persona Física</h1>
        </div>

        <div>
          <label className={baseLabel}>
            Fecha del contrato <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="fechaActualISO"
            value={form.fechaActualISO}
            onChange={onChange}
            className={baseInput}
            required
          />
        </div>
      </header>

      <section className={section}>
        <h2 className={legend}>A) Sucursal & Municipio</h2>
        <p className="text-sm text-slate-500 mb-4">Selecciona primero la sucursal; el municipio se llenará automáticamente y no es modificable.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={baseLabel}>Sucursal UNICI <span className="text-red-500">*</span></label>
            <select
              name="sucursalId"
              value={form.sucursalId}
              onChange={onChange}
              className={baseInput}
              required
            >
              <option value="">Seleccionar sucursal…</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={baseLabel}>Municipio</label>
            <input
              className={`${baseInput} bg-slate-50 text-slate-600 cursor-not-allowed`}
              value={form.municipioNombre || ''}
              readOnly
              placeholder="Se establecerá automáticamente"
            />
            <input type="hidden" name="municipioId" value={form.municipioId} />
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>B) Proveedor (Persona Física)</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={baseLabel}>Proveedor</label>
            <select
              name="proveedorId"
              value={form.proveedorId}
              onChange={onChange}
              className={baseInput}
              disabled={!form.sucursalId}
            >
              <option value="">{form.sucursalId ? 'Selecciona proveedor…' : 'Elige primero una sucursal'}</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre_proveedor}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={baseLabel}>Nombre del proveedor <span className="text-red-500">*</span></label>
            <input
              name="proveedorNombre"
              value={form.proveedorNombre}
              readOnly
              className={`${baseInput} bg-slate-50 text-slate-600 cursor-not-allowed`}
              placeholder="Se completará al elegir proveedor"
              required
            />
          </div>

          <div>
            <label className={baseLabel}>
              RFC del proveedor <span className="text-red-500">*</span>
            </label>
            <input
              name="proveedorRFC"
              value={form.proveedorRFC}
              readOnly
              className={`${baseInput} bg-slate-50 text-slate-600 cursor-not-allowed`}
              placeholder="Se completará al elegir proveedor"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={baseLabel}>Domicilio fiscal del proveedor <span className="text-red-500">*</span></label>
            <input
              name="proveedorDomicilio"
              value={form.proveedorDomicilio}
              onChange={onChange}
              className={baseInput}
              placeholder="Calle, número, colonia, ciudad, estado, CP"
              required
            />
          </div>

          <div>
            <label className={baseLabel}>Tipo de bien del proveedor <span className="text-red-500">*</span></label>
            <select
              name="proveedorTipoBien"
              value={form.proveedorTipoBien}
              onChange={onChange}
              className={baseInput}
              required
            >
              <option value="">Selecciona…</option>
              <option value="arrendamiento">Arrendamiento</option>
              <option value="título de propiedad">Título de propiedad</option>
            </select>
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>C) Objeto y tipo de prestación</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={baseLabel}>Tipo de prestación <span className="text-red-500">*</span></label>
            <select
              name="tipoPrestacion"
              value={form.tipoPrestacion}
              onChange={onChange}
              className={baseInput}
              required
            >
              <option value="">Selecciona…</option>
              <option value="servicio técnico">Servicio técnico</option>
              <option value="prestación de servicios">Prestación de servicios</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={baseLabel}>Objeto corto (descripción breve) <span className="text-red-500">*</span></label>
            <input
              name="objetoCorto"
              value={form.objetoCorto}
              onChange={onChange}
              className={baseInput}
              placeholder="p. ej. mantenimiento de aire acondicionado"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={baseLabel}>Objeto largo (descripción completa) <span className="text-red-500">*</span></label>
            <textarea
              name="objetoLargo"
              value={form.objetoLargo}
              onChange={onChange}
              rows={3}
              className={baseInput}
              placeholder="Describe el alcance completo del servicio a contratar…"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className={baseLabel}>
              Actividad preponderante del proveedor <span className="text-red-500">*</span>
            </label>
            <textarea
              name="actividadPreponderante"
              value={form.actividadPreponderante}
              readOnly
              rows={2}
              className={`${baseInput} bg-slate-50 text-slate-600 cursor-not-allowed`}
              placeholder="Se completará al elegir proveedor"
              required
            />
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>D) Precio y pagos</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={baseLabel}>Importe (en número) <span className="text-red-500">*</span></label>
            <input
              name="importeNumero"
              type="number"
              min="0"
              value={form.importeNumero}
              onChange={onChange}
              className={baseInput}
              placeholder="p. ej. 55000"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              En letra: <strong>{numeroALetrasMX(Number(form.importeNumero || '0'))}</strong>
            </p>
          </div>

          <div>
            <label className={baseLabel}>Esquema de pago</label>
            <select
              name="pagoEsquema"
              value={form.pagoEsquema}
              onChange={onChange}
              className={baseInput}
            >
              <option value="pago_unico">Pago único</option>
              <option value="anticipo_1">Anticipo + 1 pago</option>
              <option value="anticipo_2">Anticipo + 2 pagos</option>
            </select>
          </div>

          <div>
            <label className={baseLabel}>Medio de pago <span className="text-red-500">*</span></label>
            <select
              name="pagoMedio"
              value={form.pagoMedio}
              onChange={onChange}
              className={baseInput}
              required
            >
              <option value="">Selecciona…</option>
              <option value="transferencia">Transferencia electrónica</option>
              <option value="cuenta_bancaria_prestador">Cuenta bancaria del prestador</option>
              <option value="efectivo">Efectivo</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>

        {form.pagoEsquema !== 'pago_unico' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            <div>
              <label className={baseLabel}>% Anticipo</label>
              <input
                name="anticipoPct"
                type="number"
                min={1}
                max={99}
                value={form.anticipoPct}
                onChange={onChange}
                className={baseInput}
                placeholder="p. ej. 50"
              />
              <p className="text-xs text-slate-500 mt-1">
                Monto anticipo: <strong>{mxn(anticipoMonto)}</strong> ({numeroALetrasMX(anticipoMonto)})
              </p>
            </div>

            {form.pagoEsquema === 'anticipo_2' && (
              <div>
                <label className={baseLabel}>% Segundo pago</label>
                <input
                  name="segundoPagoPct"
                  type="number"
                  min={1}
                  max={98}
                  value={form.segundoPagoPct}
                  onChange={onChange}
                  className={baseInput}
                  placeholder="p. ej. 25"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Monto segundo pago: <strong>{mxn(segundoPagoMonto)}</strong> ({numeroALetrasMX(segundoPagoMonto)})
                </p>
              </div>
            )}

            <div>
              <label className={baseLabel}>Fecha/condición 2º pago</label>
              <input
                name="fechaSegundoPago"
                value={form.fechaSegundoPago}
                onChange={onChange}
                className={baseInput}
                placeholder="p. ej. al día siguiente / a la entrega"
              />
            </div>

            {form.pagoEsquema === 'anticipo_2' && (
              <div className="md:col-span-2">
                <label className={baseLabel}>Fecha/condición 3º pago</label>
                <input
                  name="fechaTercerPago"
                  value={form.fechaTercerPago}
                  onChange={onChange}
                  className={baseInput}
                  placeholder="p. ej. a la entrega / fecha específica"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Monto tercer pago (restante: {restantePct}%): <strong>{mxn(tercerPagoMonto)}</strong> ({numeroALetrasMX(tercerPagoMonto)})
                </p>
              </div>
            )}
          </div>
        )}

        {form.pagoEsquema === 'pago_unico' && (
          <div className="mt-4 text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            Se cobrará el <strong>100%</strong>: {mxn(importe)} ({importeLetra}) IVA incluido.
          </div>
        )}
      </section>

      <section className={section}>
        <h2 className={legend}>E) Plazos y garantías</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className={baseLabel}>Plazo de garantía (días)</label>
            <input
              name="plazoGarantiaDias"
              type="number"
              min={1}
              value={form.plazoGarantiaDias}
              onChange={onChange}
              className={baseInput}
              placeholder="p. ej. 30"
            />
          </div>
          <div>
            <label className={baseLabel}>Plazo de conclusión (días)</label>
            <input
              name="plazoConclusionDias"
              type="number"
              min={1}
              value={form.plazoConclusionDias}
              onChange={onChange}
              className={baseInput}
              placeholder="p. ej. 15"
            />
          </div>
          <div>
            <label className={baseLabel}>Días para pena convencional</label>
            <input
              name="diasPlazoPena"
              type="number"
              min={1}
              value={form.diasPlazoPena}
              onChange={onChange}
              className={baseInput}
              placeholder="p. ej. 15"
            />
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={legend}>F) Testigos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={baseLabel}>Testigo 1</label>
            <input
              name="testigo1"
              value={form.testigo1}
              onChange={onChange}
              className={baseInput}
              placeholder="p. ej. Johana Alavez Rodríguez"
            />
          </div>
          <div>
            <label className={baseLabel}>Testigo 2</label>
            <input
              name="testigo2"
              value={form.testigo2}
              onChange={onChange}
              className={baseInput}
              placeholder="p. ej. Ana Oasis Tamayo"
            />
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
        <span className="text-sm text-slate-500">
          (El DOCX usará este payload.)
        </span>
      </div>

      <details className="mt-2 overflow-hidden rounded-2xl border border-slate-200">
        <summary className="cursor-pointer select-none bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          Vista rápida de montos
        </summary>
        <div className="px-4 py-3 text-sm space-y-1">
          <div>Total: <strong>{mxn(importe)}</strong> ({importeLetra})</div>
          {form.pagoEsquema === 'pago_unico' && <div>Pago único: <strong>{mxn(importe)}</strong></div>}
          {form.pagoEsquema !== 'pago_unico' && (
            <>
              <div>Anticipo ({anticipoPctNum}%): <strong>{mxn(anticipoMonto)}</strong></div>
              <div>2º pago: <strong>{mxn(segundoPagoMonto)}</strong> — {form.fechaSegundoPago || 'condición no indicada'}</div>
              {form.pagoEsquema === 'anticipo_2' && (
                <div>3º pago: <strong>{mxn(tercerPagoMonto)}</strong> — {form.fechaTercerPago || 'condición no indicada'}</div>
              )}
            </>
          )}
        </div>
      </details>
    </form>
  );
}
