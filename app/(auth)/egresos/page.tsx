'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface FacturaProveedor {
  id: string;
  fecha: string;
  gasto: number;
  observación: string;
  plantel_id: string;
  proveedor: { nombre_proveedor: string } | null;
  etiqueta: { nombre_etiqueta: string } | null;
  departamento: { nombre_departamento: string } | null;
  plantel: { nombre_plantel: string } | null;
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
    const fetchFacturas = async () => {
      const { data, error } = await supabase
        .from('factura_proveedores')
        .select(`
          id,
          fecha,
          gasto,
          observación,
          plantel_id,
          proveedor:proveedor_id (nombre_proveedor),
          etiqueta:etiqueta (nombre_etiqueta),
          departamento:departamento (nombre_departamento),
          plantel:plantel_id (nombre_plantel)
        `);

      if (error) {
        console.error('Error al obtener facturas:', error.message);
        return;
      }

      if (data) {
        const facturasConSeleccion = data.map((f: any) => ({
          ...f,
          seleccionado: false,
        }));
        setFacturas(facturasConSeleccion);
      }
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

    fetchFacturas();
    fetchPlanteles();
  }, []);

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
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
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

      <div className="flex flex-nowrap gap-2 mb-6 overflow-x-auto">
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
        <table className="min-w-full table-auto">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 text-left w-12"></th>
              <th className="p-3 text-center text-nowrap">Plantel</th>
              <th className="p-3 text-center text-nowrap">Nombre del proveedor</th>
              <th className="p-3 text-center text-nowrap">Etiqueta de egreso</th>
              <th className="p-3 text-center text-nowrap">Departamento solicitante</th>
              <th className="p-3 text-center text-nowrap">Fecha de registro</th>
              <th className="p-3 text-center text-nowrap">Monto gastado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No hay facturas registradas...
                </td>
              </tr>
            ) : (
              resultados.map(factura => (
                <tr key={factura.id} className="border-t">
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
                  <td className="p-3 text-center text-nowrap">{factura.fecha}</td>
                  <td className="p-3 text-center text-nowrap">${factura.gasto.toFixed(2)}</td>
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
