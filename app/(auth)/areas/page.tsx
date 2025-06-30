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

interface Departamento {
  id: string;
  nombre_departamento: string;
  plantel_id: string;
  nombre_plantel: string | null;
  seleccionado: boolean;
}

interface Plantel {
  id: string;
  nombre: string;
}

const DepartamentosList = () => {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [filtroPlantel, setFiltroPlantel] = useState('Todos');
  const [search, setSearch] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchDepartamentos = async () => {
      const { data, error } = await supabase
        .from('departamentos')
        .select(`
          id,
          nombre_departamento,
          plantel_id,
          plantel (
            id,
            nombre_plantel
          )
        `);

      if (error) {
        console.error('Error al obtener departamentos:', error.message);
        return;
      }

      const mapeados = data.map((d: any) => ({
        id: d.id,
        nombre_departamento: d.nombre_departamento,
        plantel_id: d.plantel_id,
        nombre_plantel: d.plantel?.nombre_plantel || null,
        seleccionado: false,
      }));

      setDepartamentos(mapeados);
    };

    const fetchPlanteles = async () => {
      const { data, error } = await supabase
        .from('plantel')
        .select('id, nombre_plantel');

      if (error) {
        console.error('Error al obtener planteles:', error.message);
        return;
      }

      setPlanteles(data.map((p: any) => ({ id: p.id, nombre: p.nombre_plantel })));
    };

    fetchDepartamentos();
    fetchPlanteles();
  }, [supabase]);

  const handleAgregar = () => router.push('/areas/registro');
  const handleEditar = (id: string) => router.push(`/areas/editar/${id}`);

  const handleEliminar = async (id: string) => {
    const confirmado = window.confirm('¿Estás seguro? Esta acción no se puede deshacer.');
    if (!confirmado) return;

    const { error } = await supabase.from('departamentos').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando el área:', error.message);
      return;
    }

    setDepartamentos(prev => prev.filter(d => d.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    const ids = departamentos.filter(d => d.seleccionado).map(d => d.id);
    if (ids.length === 0) return;

    const confirmado = window.confirm('¿Eliminar áreas seleccionadas? Esta acción no se puede deshacer.');
    if (!confirmado) return;

    const { error } = await supabase.from('departamentos').delete().in('id', ids);
    if (error) {
      console.error('Error al eliminar seleccionados:', error.message);
      return;
    }

    setDepartamentos(prev => prev.filter(d => !d.seleccionado));
  };

  const handleSeleccionar = (id: string) => {
    setDepartamentos(prev =>
      prev.map(d => d.id === id ? { ...d, seleccionado: !d.seleccionado } : d)
    );
  };

  const resultados = departamentos.filter(d => {
    const coincideBusqueda = d.nombre_departamento.toLowerCase().includes(search.toLowerCase());
    const coincidePlantel = filtroPlantel === 'Todos' || d.plantel_id === filtroPlantel;
    return coincideBusqueda && coincidePlantel;
  });

  const totalPaginas = Math.ceil(resultados.length / elementosPorPagina);
  const departamentosPaginados = resultados.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina
  );

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-bold text-center text-black-800 mb-6">
        Listado de áreas
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre del área..."
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
          Agregar área
        </Button>

        <Button
          onClick={handleEliminarSeleccionados}
          className="bg-red-600 text-white flex items-center gap-2 whitespace-nowrap"
        >
          Eliminar seleccionados
        </Button>
      </div>

      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 text-left"></th>
              <th className="p-3 text-center text-nowrap">Plantel asociado</th>
              <th className="p-3 text-center text-nowrap">Nombre del departamento</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {departamentosPaginados.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No hay áreas registradas...
                </td>
              </tr>
            ) : (
              departamentosPaginados.map(depto => (
                <tr key={depto.id} className="border-t">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={depto.seleccionado}
                      onChange={() => handleSeleccionar(depto.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">
                    {depto.nombre_plantel ?? 'Sin plantel'}
                  </td>
                  <td className="p-3 text-center text-nowrap">
                    {depto.nombre_departamento}
                  </td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-yellow-400 hover:bg-yellow-400 text-white p-2 rounded"
                      onClick={() => handleEditar(depto.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                      onClick={() => handleEliminar(depto.id)}
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

      {totalPaginas > 1 && (
        <div className="flex justify-center mt-6 space-x-1">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            ←
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => cambiarPagina(i + 1)}
              className={`px-3 py-1 text-sm rounded-md border ${
                paginaActual === i + 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default DepartamentosList;
