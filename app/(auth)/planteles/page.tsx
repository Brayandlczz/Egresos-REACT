'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface Plantel {
  id: number;
  nombre: string;
  seleccionado: boolean;
}

const letrasFiltro = ['Todos', 'I', 'U'];

const PlantelList = () => {
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [search, setSearch] = useState('');
  const [filtroLetra, setFiltroLetra] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchPlanteles = async () => {
      const { data, error } = await supabase
        .from('plantel')
        .select('id, nombre_plantel');

      if (error) {
        console.error('Error al obtener planteles:', error.message);
        return;
      }

      const plantelesMapeados = data.map((p: any) => ({
        id: p.id,
        nombre: p.nombre_plantel,
        seleccionado: false,
      }));

      setPlanteles(plantelesMapeados);
    };

    fetchPlanteles();
  }, [supabase]);

  useEffect(() => {
    setPaginaActual(1);
  }, [search, filtroLetra]);

  const handleAgregar = () => router.push('/planteles/registro');
  const handleEditar = (id: number) => router.push(`/planteles/editar/${id}`);

  const handleEliminar = async (id: number) => {
    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('plantel').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando plantel:', error.message);
      return;
    }
    setPlanteles(prev => prev.filter(p => p.id !== id));
  };

  const resultadosFiltrados = planteles.filter(p => {
    const cumpleFiltroLetra =
      filtroLetra === 'Todos' || p.nombre.toUpperCase().startsWith(filtroLetra);
    const cumpleBusqueda = p.nombre.toLowerCase().includes(search.toLowerCase());
    return cumpleFiltroLetra && cumpleBusqueda;
  });

  const totalPaginas = Math.ceil(resultadosFiltrados.length / registrosPorPagina);

  const resultadosPaginados = resultadosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const handleEliminarSeleccionados = async () => {
    const idsAEliminar = planteles.filter(p => p.seleccionado).map(p => p.id);
    if (idsAEliminar.length === 0) return;

    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('plantel').delete().in('id', idsAEliminar);
    if (error) {
      console.error('Error eliminando planteles seleccionados:', error.message);
      return;
    }
    setPlanteles(prev => prev.filter(p => !p.seleccionado));
  };

  const handleSeleccionar = (id: number) => {
    setPlanteles(prev =>
      prev.map(p =>
        p.id === id ? { ...p, seleccionado: !p.seleccionado } : p
      )
    );
  };

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-light text-center text-black-800 mb-6">
        Listado de planteles
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre del plantel..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w"
        />

        <Select onValueChange={setFiltroLetra} value={filtroLetra}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los planteles" />
          </SelectTrigger>
          <SelectContent>
            {letrasFiltro.map(letra => (
              <SelectItem key={letra} value={letra}>
                {letra === 'Todos' ? 'Todos los planteles' : `Letra ${letra}`}
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
          Agregar plantel
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
              <th className="p-3 text-center whitespace-nowrap">Nombre del plantel</th>
              <th className="p-3 text-center whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultadosPaginados.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No hay planteles registrados...
                </td>
              </tr>
            ) : (
              resultadosPaginados.map(plantel => (
                <tr key={plantel.id} className="border-t">
                  <td className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={plantel.seleccionado}
                      onChange={() => handleSeleccionar(plantel.id)}
                    />
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">{plantel.nombre}</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      //className="bg-yellow-400 hover:bg-yellow-400 text-white p-2 rounded"
                      className="text-yellow-400"
                      onClick={() => handleEditar(plantel.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      //className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                      className="text-red-600"
                      onClick={() => handleEliminar(plantel.id)}
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
            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            ←
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPaginaActual(i + 1)}
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
            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
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

export default PlantelList;
