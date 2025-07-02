'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Edit2, Trash2, FileText, FileImage, File } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Archivo {
  path: string;
  nombre_original: string;
  nombre_unico: string;
}

interface Proveedor {
  id: string;
  numero_proveedor: string;
  nombre_proveedor: string;
  nombre_comercial: string;
  razon_social: string;
  persona_contacto: string;
  telefono_contacto: string;
  email: string;
  bien_proveido: string;
  tipo_persona: string;
  plantel: { nombre_plantel: string };
  archivos: Archivo[];
  seleccionado?: boolean;
}

const ProveedorList = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [search, setSearch] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchProveedores = async () => {
      const { data, error } = await supabase
        .from('proveedores')
        .select(`
          id,
          numero_proveedor,
          nombre_proveedor,
          nombre_comercial,
          razon_social,
          persona_contacto,
          telefono_contacto,
          email,
          bien_proveido,
          tipo_persona,
          plantel:plantel_id (nombre_plantel),
          archivos_p_fisica!archivos_p_fisica_proveedor_id_fkey (path, nombre_original, nombre_unico),
          archivos_p_moral!archivos_p_moral_proveedor_id_fkey (path, nombre_original, nombre_unico)
        `);

      if (error) {
        console.error('Error al obtener proveedores:', error.message);
        return;
      }

      const lista: Proveedor[] = (data as any[]).map(p => ({
        id: p.id,
        numero_proveedor: p.numero_proveedor,
        nombre_proveedor: p.nombre_proveedor,
        nombre_comercial: p.nombre_comercial,
        razon_social: p.razon_social,
        persona_contacto: p.persona_contacto,
        telefono_contacto: p.telefono_contacto,
        email: p.email,
        bien_proveido: p.bien_proveido,
        tipo_persona: p.tipo_persona,
        plantel: p.plantel,
        archivos: [
          ...(p.archivos_p_fisica || []),
          ...(p.archivos_p_moral || [])
        ],
        seleccionado: false
      }));

      setProveedores(lista);
    };

    fetchProveedores();
  }, [supabase]);

  const abrirArchivo = async (archivoPath: string) => {
    const { data: urlData, error: urlError } = await supabase.storage
      .from('archivos-proveedores')
      .createSignedUrl(archivoPath, 60 * 60);

    if (urlError) {
      console.error('Error al obtener URL firmada:', urlError.message);
      alert('No se pudo abrir el archivo.');
      return;
    }

    window.open(urlData.signedUrl, '_blank');
  };

  const handleSeleccionar = (id: string) => {
    setProveedores(prev =>
      prev.map(p => (p.id === id ? { ...p, seleccionado: !p.seleccionado } : p))
    );
  };

  const handleEliminarSeleccionados = () => {
    setProveedores(prev => prev.filter(p => !p.seleccionado));
  };

  const handleEditar = (id: string) => {
    router.push(`/proveedores/edit/${id}`);
  };

  const handleEliminar = (id: string) => {
    setProveedores(prev => prev.filter(p => p.id !== id));
  };

  const resultados = proveedores.filter(p =>
    p.numero_proveedor.toLowerCase().includes(search.toLowerCase()) ||
    p.nombre_proveedor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl text-center font-light text-black-800 mb-6">Listado de proveedores</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por número o nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w"
        />
      </div>

      <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto">
        <Link
          href="/proveedores/registro"
          className="bg-green-600 text-white text-nowrap px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
        >
          Agregar proveedor
        </Link>
        <button
          onClick={handleEliminarSeleccionados}
          className="bg-red-600 text-white text-nowrap px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
        >
          Eliminar seleccionados
        </button>
      </div>

      <div className="rounded shadow bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-center text-nowrap">Número de proveedor</th>
              <th className="p-3 text-center text-nowrap">Nombre del proveedor</th>
              <th className="p-3 text-center text-nowrap">Nombre comercial</th>
              <th className="p-3 text-center text-nowrap">Razón social</th>
              <th className="p-3 text-center text-nowrap">Persona de contacto</th>
              <th className="p-3 text-center text-nowrap">Teléfono</th>
              <th className="p-3 text-center text-nowrap">Email</th>
              <th className="p-3 text-center text-nowrap">Bien proveído</th>
              <th className="p-3 text-center text-nowrap">Tipo de persona</th>
              <th className="p-3 text-center text-nowrap">Plantel asociado</th>
              <th className="p-3 text-center text-nowrap">Documentos</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-4 text-center text-gray-500">
                  No hay proveedores registrados...
                </td>
              </tr>
            ) : (
              resultados.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.seleccionado || false}
                      onChange={() => handleSeleccionar(p.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">{p.numero_proveedor}</td>
                  <td className="p-3 text-center text-nowrap">{p.nombre_proveedor}</td>
                  <td className="p-3 text-center text-nowrap">{p.nombre_comercial}</td>
                  <td className="p-3 text-center text-nowrap">{p.razon_social}</td>
                  <td className="p-3 text-center text-nowrap">{p.persona_contacto}</td>
                  <td className="p-3 text-center text-nowrap">{p.telefono_contacto}</td>
                  <td className="p-3 text-center text-nowrap">{p.email}</td>
                  <td className="p-3 text-center text-nowrap">{p.bien_proveido}</td>
                  <td className="p-3 text-center text-nowrap">{p.tipo_persona}</td>
                  <td className="p-3 text-center text-nowrap">{p.plantel.nombre_plantel}</td>
                  <td className="p-3 text-center text-nowrap">
                    {p.archivos.length > 0 ? (
                      p.archivos.map(archivo => {
                        const ext = archivo.nombre_unico.split('.').pop()?.toLowerCase();
                        const Icon = ext === 'pdf' ? FileText :
                          ['jpg', 'jpeg', 'png'].includes(ext || '') ? FileImage :
                          File;
                        return (
                          <button
                            key={archivo.nombre_unico}
                            onClick={() => abrirArchivo(archivo.path)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline mr-2"
                            title={archivo.nombre_original}
                            type="button"
                          >
                            <Icon size={16} />
                          </button>
                        );
                      })
                    ) : (
                      <span>No hay archivos</span>
                    )}
                  </td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-yellow-400"
                      onClick={() => handleEditar(p.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleEliminar(p.id)}
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProveedorList;
