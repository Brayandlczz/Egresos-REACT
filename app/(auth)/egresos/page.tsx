'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Edit2, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface ArchivoFactura {
  id: string;
  path: string;
  nombre_original: string;
  nombre_unico: string;
}

interface FacturaProveedor {
  id: string;
  fecha: string;
  gasto: number;
  observacion: string;
  plantel_id: string;
  proveedor: { nombre_proveedor: string } | null;
  etiqueta: { nombre_etiqueta: string } | null;
  departamento: { nombre_departamento: string } | null;
  plantel: { nombre_plantel: string } | null;
  archivos?: ArchivoFactura[];
  seleccionado?: boolean;
}

interface Plantel {
  id: string;
  nombre: string;
}

const TablaFacturasProveedores = () => {
  const [facturas, setFacturas] = useState<FacturaProveedor[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [filtroPlantel, setFiltroPlantel] = useState('Todos');
  const [search, setSearch] = useState('');

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchFacturasConArchivos = async () => {
      const { data: facturasData, error: errorFacturas } = await supabase
        .from('factura_proveedores')
        .select(`
          id,
          fecha,
          gasto,
          observacion,
          plantel_id,
          proveedor:proveedor_id (nombre_proveedor),
          etiqueta:etiqueta (nombre_etiqueta),
          departamento:departamento (nombre_departamento),
          plantel:plantel_id (nombre_plantel)
        `);

      if (errorFacturas) {
        console.error('Error al obtener facturas:', errorFacturas.message);
        return;
      }

      if (!facturasData) return;

      const facturaIds = facturasData.map(f => f.id);

      const { data: archivosData, error: errorArchivos } = await supabase
        .from('factura_archivos_proveedor')
        .select('id, path, factura_id, nombre_original, nombre_unico')
        .in('factura_id', facturaIds);

      if (errorArchivos) {
        console.error('Error al obtener archivos de facturas:', errorArchivos.message);
        return;
      }

      const archivosPorFactura: Record<string, ArchivoFactura[]> = {};
      archivosData?.forEach(archivo => {
        if (!archivosPorFactura[archivo.factura_id]) {
          archivosPorFactura[archivo.factura_id] = [];
        }
        archivosPorFactura[archivo.factura_id].push(archivo);
      });

      const facturasConArchivos = facturasData.map((factura: any) => ({
        ...factura,
        archivos: archivosPorFactura[factura.id] || [],
        seleccionado: false,
      }));

      setFacturas(facturasConArchivos);
    };

    const fetchPlanteles = async () => {
      const { data, error } = await supabase
        .from('plantel')
        .select('id, nombre_plantel');

      if (error) {
        console.error('Error al obtener planteles:', error.message);
        return;
      }

      if (data) {
        setPlanteles(data.map(p => ({ id: p.id, nombre: p.nombre_plantel })));
      }
    };

    fetchFacturasConArchivos();
    fetchPlanteles();
  }, []);

  const abrirArchivo = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('factura-egresos-proveedor')
      .createSignedUrl(path, 3600);

    if (error) {
      alert('Error al obtener archivo: ' + error.message);
      return;
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    }
  };

  const handleAgregar = () => router.push('/egresos/registro');
  const handleEditar = (id: string) => router.push(`/egresos/editar/${id}`);

  const handleEliminar = async (id: string) => {
    const confirmado = window.confirm('¿Estás seguro que deseas eliminar esta factura?');
    if (!confirmado) return;

    const { error } = await supabase.from('factura_proveedores').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando la factura:', error.message);
      return;
    }

    setFacturas(prev => prev.filter(f => f.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    const idsAEliminar = facturas.filter(f => f.seleccionado).map(f => f.id);
    if (idsAEliminar.length === 0) return;

    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otros registros en el sistema. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase
      .from('factura_proveedores')
      .delete()
      .in('id', idsAEliminar);

    if (error) {
      console.error('Error eliminando facturas seleccionadas:', error.message);
      return;
    }

    setFacturas(prev => prev.filter(f => !f.seleccionado));
  };

  const handleSeleccionar = (id: string) => {
    setFacturas(prev =>
      prev.map(f =>
        f.id === id ? { ...f, seleccionado: !f.seleccionado } : f
      )
    );
  };

  const resultados = facturas.filter(f => {
    const coincideBusqueda = f.proveedor?.nombre_proveedor
      .toLowerCase()
      .includes(search.toLowerCase());

    const coincidePlantel = filtroPlantel === 'Todos' || f.plantel_id === filtroPlantel;

    return coincideBusqueda && coincidePlantel;
  });

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-light text-center text-black-800 mb-6">
        Listado de facturas de proveedores
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por proveedor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />

        <Select onValueChange={setFiltroPlantel} value={filtroPlantel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por plantel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los planteles</SelectItem>
            {planteles.map(p => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto">
        <Button
          className="bg-green-600 text-white flex items-center gap-2 whitespace-nowrap"
          onClick={handleAgregar}
        >
          Agregar factura
        </Button>

        <Button
          className="bg-red-600 text-white flex items-center gap-2 whitespace-nowrap"
          onClick={handleEliminarSeleccionados}
        >
          Eliminar seleccionados
        </Button>
      </div>

      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-center text-nowrap">Plantel</th>
              <th className="p-3 text-center text-nowrap">Nombre del proveedor</th>
              <th className="p-3 text-center text-nowrap">Etiqueta de egreso</th>
              <th className="p-3 text-center text-nowrap">Departamento solicitante</th>
              <th className="p-3 text-center text-nowrap">Fecha de registro</th>
              <th className="p-3 text-center text-nowrap">Monto gastado</th>
              <th className="p-3 text-center text-nowrap">Archivos</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  No hay facturas registradas...
                </td>
              </tr>
            ) : (
              resultados.map(factura => (
                <tr key={factura.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={factura.seleccionado}
                      onChange={() => handleSeleccionar(factura.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">{factura.plantel?.nombre_plantel || '—'}</td>
                  <td className="p-3 text-center text-nowrap">{factura.proveedor?.nombre_proveedor || '—'}</td>
                  <td className="p-3 text-center text-nowrap">{factura.etiqueta?.nombre_etiqueta || '—'}</td>
                  <td className="p-3 text-center text-nowrap">{factura.departamento?.nombre_departamento || '—'}</td>
                  <td className="p-3 text-center text-nowrap">
                    {factura.fecha
                      ? new Date(factura.fecha).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="p-3 text-center text-nowrap">${factura.gasto.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center gap-1">
                      {factura.archivos && factura.archivos.length > 0 ? (
                        factura.archivos.map(archivo => (
                          <Button
                            key={archivo.id}
                            variant="ghost"
                            size="icon"
                            title={`Ver archivo: ${archivo.nombre_original}`}
                            onClick={() => abrirArchivo(archivo.path)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FileText size={20} />
                          </Button>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No hay archivos</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-yellow-400"
                      onClick={() => handleEditar(factura.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleEliminar(factura.id)}
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

export default TablaFacturasProveedores;
