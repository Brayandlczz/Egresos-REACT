'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useParams } from 'next/navigation';
import { ThreeDot } from 'react-loading-indicators';

interface Plantel {
  id: string;
  nombre_plantel: string;
}

const RFC_REGEX = /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z0-9]{2}[A0-9]$/;

const EditarProveedor: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);

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
    rfc: '',                      
    actividadPreponderante: '',   
  });

  const [archivosFisicaFiles, setArchivosFisicaFiles] = useState<(File | null)[]>(Array(6).fill(null));
  const [archivosMoralFiles, setArchivosMoralFiles] = useState<(File | null)[]>(Array(8).fill(null));
  const [archivosExistentes, setArchivosExistentes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const archivosFisica = [
    { nombre: 'INE', clave: 'ine' },
    { nombre: 'RFC', clave: 'rfc' },
    { nombre: 'CURP', clave: 'curp' },
    { nombre: 'Comprobante de domicilio', clave: 'comprobante_domicilio' },
    { nombre: 'Estado de cuenta bancario', clave: 'estado_cuenta_bancario' },
    { nombre: 'Opinión de cumplimiento SAT', clave: 'opinion_cumplimiento_sat' },
  ];

  const archivosMoral = [
    { nombre: 'Acta constitutiva', clave: 'acta_constitutiva' },
    { nombre: 'Poder notarial', clave: 'poder_notarial' },
    { nombre: 'RFC', clave: 'rfc' },
    { nombre: 'Comprobante de domicilio', clave: 'comprobante_domicilio' },
    { nombre: 'Estado de cuenta bancario', clave: 'estado_cuenta_bancario' },
    { nombre: 'Opinión de cumplimiento SAT', clave: 'opinion_cumplimiento_sat' },
    { nombre: 'INE representante legal', clave: 'ine_representante_legal' },
    { nombre: 'CURP representante legal', clave: 'curp_representante_legal' },
  ];

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

  const fetchProveedor = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data: proveedor, error: errorProv } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id', id)
        .single();

      if (errorProv || !proveedor) {
        console.error('Error obteniendo proveedor:', errorProv);
        setLoading(false);
        return;
      }

      setFormData({
        nombreProveedor: proveedor.nombre_proveedor || '',
        nombreComercial: proveedor.nombre_comercial || '',
        razonSocial: proveedor.razon_social || '',
        personaContacto: proveedor.persona_contacto || '',
        telefonoContacto: proveedor.telefono_contacto || '',
        email: proveedor.email || '',
        bienProveido: proveedor.bien_proveido || '',
        tipoPersona: proveedor.tipo_persona || '',
        rfc: (proveedor.rfc ?? '').toUpperCase(),                                      
        actividadPreponderante: proveedor.actividad_preponderante ?? '',               
      });

      setPlantelId(proveedor.plantel_id || '');
      setNumeroProveedor(proveedor.numero_proveedor || '');

      const tablaArchivos = proveedor.tipo_persona === 'Física' ? 'archivos_p_fisica' : 'archivos_p_moral';

      const { data: archivosDB, error: errArchivos } = await supabase
        .from(tablaArchivos)
        .select('*')
        .eq('proveedor_id', id);

      if (errArchivos) {
        console.error('Error cargando archivos existentes:', errArchivos);
      } else {
        setArchivosExistentes(archivosDB || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanteles();
  }, []);

  useEffect(() => {
    fetchProveedor();
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArchivoFisicaChange = (index: number, file: File | null) => {
    setArchivosFisicaFiles((prev) => {
      const copia = [...prev];
      copia[index] = file;
      return copia;
    });
  };

  const handleArchivoMoralChange = (index: number, file: File | null) => {
    setArchivosMoralFiles((prev) => {
      const copia = [...prev];
      copia[index] = file;
      return copia;
    });
  };

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
      rfc,
      actividadPreponderante,
    } = formData;

    if (
      !plantelId ||
      !numeroProveedor ||
      !nombreProveedor ||
      !nombreComercial ||
      !razonSocial ||
      !personaContacto ||
      !telefonoContacto ||
      !email ||
      !bienProveido ||
      !tipoPersona ||
      !rfc ||
      !actividadPreponderante
    ) {
      alert('Debe llenar todos los campos.');
      return;
    }

    const rfcVal = rfc.trim().toUpperCase();
    if (!RFC_REGEX.test(rfcVal)) {
      alert('El RFC no es válido. Verifique el formato.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('proveedores')
        .update({
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
          rfc: rfcVal,                                        
          actividad_preponderante: actividadPreponderante,    
        })
        .eq('id', id);

      if (updateError) {
        alert('Error al actualizar proveedor: ' + updateError.message);
        setLoading(false);
        return;
      }

      const tablaArchivos = tipoPersona === 'Física' ? 'archivos_p_fisica' : 'archivos_p_moral';
      const bucketFolder = tipoPersona === 'Física' ? 'fisica' : 'moral';

      const archivosNuevos =
        tipoPersona === 'Física'
          ? archivosFisicaFiles.map((file, i) => ({
              file,
              clave: archivosFisica[i].clave,
              nombre: archivosFisica[i].nombre,
              index: i + 1,
            }))
          : archivosMoralFiles.map((file, i) => ({
              file,
              clave: archivosMoral[i].clave,
              nombre: archivosMoral[i].nombre,
              index: i + 1,
            }));

      for (const archivo of archivosNuevos) {
        if (!archivo.file) continue;

        const archivoExistente = archivosExistentes.find((a) =>
          a.nombre_unico.includes(`-${String(archivo.index).padStart(2, '0')}.`)
        );

        if (!archivoExistente) {
          alert(`No se encontró archivo existente para el índice ${archivo.index} (${archivo.clave})`);
          setLoading(false);
          return;
        }

        const nombreUnico = archivoExistente.nombre_unico;
        const pathStorage = `${bucketFolder}/${nombreUnico}`;

        const { error: uploadError } = await supabase.storage
          .from('archivos-proveedores')
          .upload(pathStorage, archivo.file, { upsert: true });

        if (uploadError) {
          alert(`Error subiendo archivo ${archivo.nombre}: ${uploadError.message}`);
          setLoading(false);
          return;
        }

        const { error: updateArchivoError } = await supabase
          .from(tablaArchivos)
          .update({
            nombre_original: archivo.file.name,
            path: pathStorage,
          })
          .eq('id', archivoExistente.id);

        if (updateArchivoError) {
          alert(`Error actualizando registro de archivo ${archivo.nombre}: ${updateArchivoError.message}`);
          setLoading(false);
          return;
        }
      }

      setSuccessMessage('Proveedor actualizado con éxito.');
      setTimeout(() => router.push('/proveedores'), 2000);
    } catch (e) {
      alert('Error al actualizar proveedor');
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        <span className="font-bold text-black">Proveedores</span> | Edición de Proveedor
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">Datos del proveedor</div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-medium">Plantel asociado:</label>
            <select
              value={plantelId}
              onChange={(e) => setPlantelId(e.target.value)}
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
            <label className="block mb-1 font-medium">RFC del proveedor:</label>
            <input
              type="text"
              value={formData.rfc}
              onChange={(e) =>
                handleInputChange('rfc', e.target.value.toUpperCase().replace(/\s+/g, ''))
              }
              className={`w-full p-2 border rounded ${
                formData.rfc && !RFC_REGEX.test(formData.rfc.toUpperCase()) ? 'border-red-500' : ''
              }`}
              disabled={loading}
              maxLength={13}
              autoComplete="off"
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

          <div className="md:col-span-3">
            <label className="block mb-1 font-medium">Actividad preponderante del proveedor:</label>
            <textarea
              value={formData.actividadPreponderante}
              onChange={(e) => handleInputChange('actividadPreponderante', e.target.value)}
              className="w-full p-2 border rounded min-h-[72px]"
              disabled={loading}
            />
          </div>
        </div>

        {formData.tipoPersona === 'Física' && (
          <div className="p-4 border-t">
            <h3 className="font-semibold mb-3">Archivos para Persona Física</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {archivosFisica.map((archivo, i) => (
                <div key={archivo.clave}>
                  <label className="block mb-1 font-medium">{archivo.nombre}:</label>
                  <input
                    type="file"
                    onChange={(e) => handleArchivoFisicaChange(i, e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.tipoPersona === 'Moral' && (
          <div className="p-4 border-t">
            <h3 className="font-semibold mb-3">Archivos para Persona Moral</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {archivosMoral.map((archivo, i) => (
                <div key={archivo.clave}>
                  <label className="block mb-1 font-medium">{archivo.nombre}:</label>
                  <input
                    type="file"
                    onChange={(e) => handleArchivoMoralChange(i, e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={loading}
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

export default EditarProveedor;
