'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
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

interface OfertaEducativa {
  id: string;
  nombre: string;
  plantel: string | null;
  seleccionado: boolean;
}

interface Plantel {
  id: string;
  nombre_plantel: string;
}

const OfertaEducativaList: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [ofertas, setOfertas] = useState<OfertaEducativa[]>([]);
  const [search, setSearch] = useState('');
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [filtroPlantel, setFiltroPlantel] = useState<string>('Todos');

  useEffect(() => {
    const fetchPlanteles = async () => {
      const { data, error } = await supabase.from('plantel').select('id, nombre_plantel');
      if (error) {
        console.error('Error al obtener planteles:', error.message);
        return;
      }
      setPlanteles(data || []);
    };
    fetchPlanteles();
  }, []);

  useEffect(() => {
    const fetchOfertas = async () => {
      const { data, error } = await supabase
        .from('oferta_educativa')
        .select(`
          id,
          nombre_oferta,
          plantel (
            id,
            nombre_plantel
          )
        `);

      if (error) {
        console.error('Error cargando ofertas educativas:', error.message);
        return;
      }

      const mapeado = (data || []).map((o: any) => ({
        id: o.id,
        nombre: o.nombre_oferta,
        plantel: o.plantel?.nombre_plantel || null,
        seleccionado: false,
      }));

      setOfertas(mapeado);
    };

    fetchOfertas();
  }, [supabase]);

  const handleAgregar = () => router.push('/ofertas/registro');
  const handleEditar = (id: string) => router.push(`/ofertas/editar/${id}`);

  const handleEliminar = async (id: string) => {
    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('oferta_educativa').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando la oferta educativa:', error.message);
      return;
    }

    setOfertas(prev => prev.filter(o => o.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    const idsAEliminar = ofertas.filter(o => o.seleccionado).map(o => o.id);
    if (idsAEliminar.length === 0) return;

    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('oferta_educativa').delete().in('id', idsAEliminar);
    if (error) {
      console.error('Error eliminando ofertas educativas seleccionadas:', error.message);
      return;
    }

    setOfertas(prev => prev.filter(o => !o.seleccionado));
  };

  const handleSeleccionar = (id: string) => {
    setOfertas(prev =>
      prev.map(o =>
        o.id === id ? { ...o, seleccionado: !o.seleccionado } : o
      )
    );
  };

  const resultados = ofertas.filter(o => {
    const coincideNombre = o.nombre.toLowerCase().includes(search.toLowerCase());
    const coincidePlantel =
      filtroPlantel === 'Todos' || o.plantel === planteles.find(p => p.id === filtroPlantel)?.nombre_plantel;
    return coincideNombre && coincidePlantel;
  });

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-4">
        Listado de ofertas educativas
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre de la oferta educativa..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w"
        />
        <Select onValueChange={setFiltroPlantel} value={filtroPlantel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los planteles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los planteles</SelectItem>
            {planteles.map((plantel) => (
              <SelectItem key={plantel.id} value={plantel.id}>
                {plantel.nombre_plantel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-nowrap gap-2 mb-6 overflow-x-auto">
        <Button
          onClick={handleAgregar}
          className="bg-green-600 text-white flex items-center gap-2 whitespace-nowrap"
        >
          Agregar oferta
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
              <th className="p-3 text-center text-nowrap">Nombre de la oferta educativa</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No hay ofertas educativas registradas...
                </td>
              </tr>
            ) : (
              resultados.map((oferta) => (
                <tr key={oferta.id} className="border-t">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={oferta.seleccionado}
                      onChange={() => handleSeleccionar(oferta.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">
                    {oferta.plantel || 'Sin plantel'}
                  </td>
                  <td className="p-3 text-center text-nowrap">{oferta.nombre}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-yellow-400 hover:bg-yellow-400 text-white p-2 rounded"
                        onClick={() => handleEditar(oferta.id)}
                        title="Editar"
                      >
                        <Edit2 size={20} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                        onClick={() => handleEliminar(oferta.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
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

export default OfertaEducativaList;
