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

interface ConceptoPago {
  id: string;
  descripcion: string;
  plantel_id: string | null;
  nombre_plantel: string | null;
  seleccionado: boolean;
}

interface Plantel {
  id: string;
  nombre: string;
}

const ConceptosPagoList = () => {
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [filtroPlantel, setFiltroPlantel] = useState('Todos');
  const [search, setSearch] = useState('');

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchConceptos = async () => {
      const { data, error } = await supabase
        .from('concepto_pago')
        .select(`
          id,
          descripcion,
          plantel_id,
          plantel (
            id,
            nombre_plantel
          )
        `);

      if (error) {
        console.error('Error al obtener conceptos:', error.message);
        return;
      }

      const conceptosMapeados = data.map((c: any) => ({
        id: c.id,
        descripcion: c.descripcion,
        plantel_id: c.plantel_id,
        nombre_plantel: c.plantel?.nombre_plantel || null,
        seleccionado: false,
      }));

      setConceptos(conceptosMapeados);
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

    fetchConceptos();
    fetchPlanteles();
  }, [supabase]);

  const handleAgregar = () => router.push('/conceptos/registro');

  const handleEditar = (id: string) => {
    router.push(`/conceptos/editar/${id}`);
  };

  const handleEliminar = async (id: string) => {
    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('concepto_pago').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando el concepto:', error.message);
      return;
    }

    setConceptos(prev => prev.filter(c => c.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    const idsAEliminar = conceptos.filter(c => c.seleccionado).map(c => c.id);
    if (idsAEliminar.length === 0) return;

    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('concepto_pago').delete().in('id', idsAEliminar);
    if (error) {
      console.error('Error eliminando conceptos seleccionados:', error.message);
      return;
    }

    setConceptos(prev => prev.filter(c => !c.seleccionado));
  };

  const handleSeleccionar = (id: string) => {
    setConceptos(prev =>
      prev.map(c =>
        c.id === id ? { ...c, seleccionado: !c.seleccionado } : c
      )
    );
  };

  const resultados = conceptos.filter(c => {
    const coincideBusqueda = c.descripcion.toLowerCase().includes(search.toLowerCase());
    const coincidePlantel =
      filtroPlantel === 'Todos' || c.plantel_id === filtroPlantel;
    return coincideBusqueda && coincidePlantel;
  });

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
        Listado de conceptos de pago
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre del concepto de pago..."
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
          Agregar concepto
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
              <th className="p-3 text-center text-nowrap">Descripción del concepto</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No hay conceptos de pago registrados...
                </td>
              </tr>
            ) : (
              resultados.map(concepto => (
                <tr key={concepto.id} className="border-t">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={concepto.seleccionado}
                      onChange={() => handleSeleccionar(concepto.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">
                    {concepto.nombre_plantel ?? 'Sin plantel'}
                  </td>
                  <td className="p-3 text-center text-nowrap">{concepto.descripcion}</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-yellow-400 hover:bg-yellow-400 text-white p-2 rounded"
                      onClick={() => handleEditar(concepto.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                      onClick={() => handleEliminar(concepto.id)}
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

export default ConceptosPagoList;
