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

interface Etiqueta {
  id: string;
  nombre_etiqueta: string;
  plantel_id: string | null;
  nombre_plantel: string | null;
  seleccionado: boolean;
}

interface Plantel {
  id: string;
  nombre: string;
}

const EtiquetasList = () => {
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [filtroPlantel, setFiltroPlantel] = useState('Todos');
  const [search, setSearch] = useState('');

  const [paginaActual, setPaginaActual] = useState(1);
  const etiquetasPorPagina = 10;

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchEtiquetas = async () => {
      const { data, error } = await supabase
        .from('etiquetas')
        .select(`
          id,
          nombre_etiqueta,
          plantel_id,
          plantel (
            id,
            nombre_plantel
          )
        `);

      if (error) {
        console.error('Error al obtener etiquetas:', error.message);
        return;
      }

      const etiquetasMapeadas = data.map((e: any) => ({
        id: e.id,
        nombre_etiqueta: e.nombre_etiqueta,
        plantel_id: e.plantel_id,
        nombre_plantel: e.plantel?.nombre_plantel || null,
        seleccionado: false,
      }));

      setEtiquetas(etiquetasMapeadas);
    };

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
      }));

      setPlanteles(plantelesMapeados);
    };

    fetchEtiquetas();
    fetchPlanteles();
  }, [supabase]);

  const handleAgregar = () => router.push('/etiquetas/registro');

  const handleEditar = (id: string) => {
    router.push(`/etiquetas/editar/${id}`);
  };

  const handleEliminar = async (id: string) => {
    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otros registros en el sistema. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('etiquetas').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando la etiqueta:', error.message);
      return;
    }

    setEtiquetas(prev => prev.filter(e => e.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    const idsAEliminar = etiquetas.filter(e => e.seleccionado).map(e => e.id);
    if (idsAEliminar.length === 0) return;

    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otros registros en el sistema. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('etiquetas').delete().in('id', idsAEliminar);
    if (error) {
      console.error('Error eliminando etiquetas:', error.message);
      return;
    }

    setEtiquetas(prev => prev.filter(e => !e.seleccionado));
  };

  const handleSeleccionar = (id: string) => {
    setEtiquetas(prev =>
      prev.map(e => (e.id === id ? { ...e, seleccionado: !e.seleccionado } : e))
    );
  };

  const resultados = etiquetas.filter(e => {
    const coincideBusqueda = e.nombre_etiqueta.toLowerCase().includes(search.toLowerCase());
    const coincidePlantel = filtroPlantel === 'Todos' || e.plantel_id === filtroPlantel;
    return coincideBusqueda && coincidePlantel;
  });

  const totalPaginas = Math.ceil(resultados.length / etiquetasPorPagina);
  const etiquetasPaginadas = resultados.slice(
    (paginaActual - 1) * etiquetasPorPagina,
    paginaActual * etiquetasPorPagina
  );

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-light text-center text-black-800 mb-6">
        Listado de clasificación de gastos
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre de clasificación..."
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

      <div className="flex gap-2 mb-4 overflow-x-auto">
        <Button
          className="bg-green-600 text-white flex items-center gap-2 whitespace-nowrap"
          onClick={handleAgregar}
        >
          Agregar clasificación
        </Button>

        <Button
          onClick={handleEliminarSeleccionados}
          className="bg-red-600 text-white flex items-center gap-2 whitespace-nowrap"
        >
          Eliminar seleccionados
        </Button>
      </div>

      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 text-left"></th>
              <th className="p-3 text-center text-nowrap">Plantel asociado</th>
              <th className="p-3 text-center text-nowrap">Nombre de la clasificación</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {etiquetasPaginadas.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No hay etiquetas registradas...
                </td>
              </tr>
            ) : (
              etiquetasPaginadas.map(etiqueta => (
                <tr key={etiqueta.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={etiqueta.seleccionado}
                      onChange={() => handleSeleccionar(etiqueta.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">
                    {etiqueta.nombre_plantel ?? 'Sin plantel'}
                  </td>
                  <td className="p-3 text-center text-nowrap">{etiqueta.nombre_etiqueta}</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-yellow-400"
                      onClick={() => handleEditar(etiqueta.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleEliminar(etiqueta.id)}
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
            aria-label="Página anterior"
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
              aria-current={paginaActual === i + 1 ? 'page' : undefined}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Página siguiente"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default EtiquetasList;
