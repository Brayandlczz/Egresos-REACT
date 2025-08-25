'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { ThreeDot } from 'react-loading-indicators';

interface Plantel {
  id: string;
  nombre_plantel: string;
}

const RegistroProveedor: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [plantelId, setPlantelId] = useState('');
  const [numeroProveedor, setNumeroProveedor] = useState('');

  const [formData, setFormData] = useState({
    nombreProveedor: '',
    nombreComercial: '',
    razonSocial: '',
    personaContacto: '',
    telefonoContacto: '',
    email: '',
    bienProveido: '',
    tipoPersona: '',
  });

  const [archivos, setArchivos] = useState<(File | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPlanteles = async () => {
    const { data, error } = await supabase
      .from('plantel')
      .select('id, nombre_plantel')
      .order('nombre_plantel', { ascending: true });

    if (error) {
      console.error('Error cargando planteles:', error);
      return;
    }
    setPlanteles(data || []);
  };

  useEffect(() => {
    fetchPlanteles();
  }, []);

  const generarNumeroProveedor = async (plantelNombre: string) => {
    const prefijo = plantelNombre
      .toUpperCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const { count, error } = await supabase
      .from('proveedores')
      .select('*', { count: 'exact', head: true })
      .ilike('numero_proveedor', `${prefijo}-%`);

    if (error) {
      console.error('Error generando número de proveedor:', error);
      return;
    }
    const nuevoNumero = `${prefijo}-${String((count ?? 0) + 1).padStart(3, '0')}`;
    setNumeroProveedor(nuevoNumero);
  };

  const handlePlantelChange = async (value: string) => {
    setPlantelId(value);
    const seleccionado = planteles.find((p) => p.id === value);
    if (seleccionado) await generarNumeroProveedor(seleccionado.nombre_plantel);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const archivosRequeridos = useMemo(() => {
    const archivosFisica = [
      'Constancia de situación fiscal (actualizada)',
      '32-D Opinión de cumplimiento de obligaciones fiscales',
      'Opinión del cumplimiento de obligaciones',
      'Comprobante de domicilio',
      'Identificación oficial vigente',
      'Carátula de estado de cuenta',
    ];

    const archivosMoral = [
      'Constancia de situación fiscal (actualizada)',
      '32-D Opinión de cumplimiento de obligaciones fiscales',
      'Opinión del cumplimiento de obligaciones',
      'Comprobante de domicilio',
      'Acta constitutiva',
      'Poder notarial',
      'Identificación oficial vigente',
      'Carátula de estado de cuenta',
    ];

    return formData.tipoPersona === 'Física'
      ? archivosFisica
      : formData.tipoPersona === 'Moral'
      ? archivosMoral
      : [];
  }, [formData.tipoPersona]);

  const handleGuardar = async () => {
    const {
      nombreProveedor,
      nombreComercial,
      razonSocial,
      personaContacto,
      telefonoContacto,
      email,
      bienProveido,
      tipoPersona,
    } = formData;

    if (
      !plantelId || !numeroProveedor ||
      !nombreProveedor || !nombreComercial || !razonSocial ||
      !personaContacto || !telefonoContacto || !email || !bienProveido || !tipoPersona
    ) {
      alert('Debe llenar todos los campos.');
      return;
    }

    if (archivosRequeridos.some((_, i) => !archivos[i])) {
      alert('Debe cargar todos los archivos requeridos antes de guardar.');
      return;
    }

    setLoading(true);

    const { data: proveedorInsertado, error: errorInsert } = await supabase
      .from('proveedores')
      .insert([
        {
          nombre_proveedor: nombreProveedor,
          nombre_comercial: nombreComercial,
          razon_social: razonSocial,
          persona_contacto: personaContacto,
          telefono_contacto: telefonoContacto,
          email,
          bien_proveido: bienProveido,
          tipo_persona: tipoPersona,
          numero_proveedor: numeroProveedor,
          plantel_id: plantelId,
        },
      ])
      .select()
      .single();

    if (errorInsert || !proveedorInsertado) {
      console.error('Error insertando proveedor:', errorInsert);
      alert('Error al registrar proveedor');
      setLoading(false);
      return;
    }

    const proveedorId = proveedorInsertado.id;
    const tablaDestino = tipoPersona === 'Física' ? 'archivos_p_fisica' : 'archivos_p_moral';
    const carpeta = tipoPersona === 'Física' ? 'fisica' : 'moral';

    const uploads = await Promise.all(
      archivos.map(async (archivo, i) => {
        if (!archivo) return null;

        const extension = archivo.name.split('.').pop() || '';
        const consecutivo = String(i + 1).padStart(2, '0');
        const nombreUnico = `${numeroProveedor}-${consecutivo}.${extension}`;
        const ruta = `${carpeta}/${nombreUnico}`;

        const { error: uploadError } = await supabase.storage
          .from('archivos-proveedores')
          .upload(ruta, archivo);

        if (uploadError) {
          console.error(`Error subiendo archivo ${i}:`, uploadError);
          return null;
        }

        return {
          proveedor_id: proveedorId,
          path: ruta,
          nombre_original: archivo.name,
          nombre_unico: nombreUnico,
        };
      })
    );

    const archivosFiltrados = uploads.filter(Boolean);

    if (archivosFiltrados.length > 0) {
      const { error: insertArchivosError } = await supabase
        .from(tablaDestino)
        .insert(archivosFiltrados);

      if (insertArchivosError) {
        console.error('Error insertando archivos:', insertArchivosError);
        alert('Error al guardar archivos');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setSuccessMessage('Proveedor y archivos registrados con éxito.');
    setTimeout(() => router.push('/proveedores'), 2000);
  };

  const handleCancelar = () => router.push('/proveedores');

  return (
    <div className="relative p-8 bg-white-100 max-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <ThreeDot color="#2464ec" size="large" />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded shadow">
          {successMessage}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">
        <span className="font-bold text-black">Proveedores</span> | Registro de Proveedor
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">Datos del proveedor</div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">Plantel asociado:</label>
            <select
              value={plantelId}
              onChange={(e) => handlePlantelChange(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="">Seleccione un plantel</option>
              {planteles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre_plantel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Número de proveedor:</label>
            <input
              type="text"
              value={numeroProveedor}
              readOnly
              className="w-full p-2 border rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Nombre del proveedor:</label>
            <input
              type="text"
              value={formData.nombreProveedor}
              onChange={(e) => handleInputChange('nombreProveedor', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Nombre comercial:</label>
            <input
              type="text"
              value={formData.nombreComercial}
              onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Razón social:</label>
            <input
              type="text"
              value={formData.razonSocial}
              onChange={(e) => handleInputChange('razonSocial', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Persona de contacto:</label>
            <input
              type="text"
              value={formData.personaContacto}
              onChange={(e) => handleInputChange('personaContacto', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Teléfono de contacto:</label>
            <input
              type="tel"
              value={formData.telefonoContacto}
              onChange={(e) => handleInputChange('telefonoContacto', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Correo electrónico:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Bien proveído:</label>
            <input
              type="text"
              value={formData.bienProveido}
              onChange={(e) => handleInputChange('bienProveido', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-1">
            <label className="block mb-1 font-medium">Tipo de persona Física/Moral*:</label>
            <select
              value={formData.tipoPersona}
              onChange={(e) => handleInputChange('tipoPersona', e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="">Seleccionar</option>
              <option value="Física">Física</option>
              <option value="Moral">Moral</option>
            </select>
          </div>
        </div>

        {archivosRequeridos.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="text-lg font-medium mb-2">
              Cargar archivos requeridos para registro de proveedor ({archivosRequeridos.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {archivosRequeridos.map((nombre, i) => (
                <div key={i}>
                  <label className="block mb-1 font-medium">{nombre}:</label>
                  <input
                    type="file"
                    required
                    className={`w-full p-2 border rounded ${!archivos[i] && 'border-red-500'}`}
                    disabled={loading}
                    onChange={(e) => {
                      const files = [...archivos];
                      files[i] = e.target.files?.[0] ?? null;
                      setArchivos(files);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 flex justify-end gap-2 border-t">
          <button
            onClick={handleCancelar}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistroProveedor;