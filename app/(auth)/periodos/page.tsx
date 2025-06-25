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

interface PeriodoPago {
  id: string;
  inicio_periodo: string;
  fin_periodo: string;
  tipo_periodo: string;
  concatenado: string;
  plantel_nombre: string;
  seleccionado: boolean;
}

interface Plantel {
  id: string;
  nombre: string;
}

const PeriodoPagoList: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [periodos, setPeriodos] = useState<PeriodoPago[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [search, setSearch] = useState('');
  const [filtroPlantel, setFiltroPlantel] = useState('Todos');

  useEffect(() => {
    const fetchPeriodos = async () => {
      const { data, error } = await supabase
        .from('periodo_pago')
        .select(`
          id,
          inicio_periodo,
          fin_periodo,
          tipo_periodo,
          concatenado,
          plantel (
            nombre_plantel
          )
        `);

      if (error) {
        console.error('Error cargando periodos de pago:', error.message);
        return;
      }

      if (data) {
        const mapeado = data.map((p: any) => ({
          id: p.id,
          inicio_periodo: p.inicio_periodo,
          fin_periodo: p.fin_periodo,
          tipo_periodo: p.tipo_periodo,
          concatenado: p.concatenado,
          plantel_nombre: p.plantel ? p.plantel.nombre_plantel : 'Sin plantel',
          seleccionado: false,
        }));
        setPeriodos(mapeado);
      }
    };

    const fetchPlanteles = async () => {
      const { data, error } = await supabase
        .from('plantel')
        .select('id, nombre_plantel');

      if (error) {
        console.error('Error obteniendo planteles:', error.message);
        return;
      }

      const mapeado = data.map((p: any) => ({
        id: p.id,
        nombre: p.nombre_plantel,
      }));

      setPlanteles(mapeado);
    };

    fetchPeriodos();
    fetchPlanteles();
  }, [supabase]);

  const formatearFecha = (fechaISO: string): string => {
    const [año, mes, dia] = fechaISO.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    const opciones: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const formateada = fecha.toLocaleDateString('es-MX', opciones);
    return formateada.charAt(0).toUpperCase() + formateada.slice(1);
  };

  const handleAgregar = () => {
    router.push('/periodos/registro');
  };

  const handleEditar = (id: string) => {
    router.push(`/periodos/editar/${id}`);
  };

  const handleEliminar = async (id: string) => {
    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('periodo_pago').delete().eq('id', id);
    if (error) {
      console.error('Error eliminando el periodo de pago:', error.message);
      return;
    }

    setPeriodos(prev => prev.filter(p => p.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    const idsAEliminar = periodos.filter(p => p.seleccionado).map(p => p.id);
    if (idsAEliminar.length === 0) return;

    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase
      .from('periodo_pago')
      .delete()
      .in('id', idsAEliminar);

    if (error) {
      console.error('Error eliminando periodos seleccionados:', error.message);
      return;
    }

    setPeriodos(prev => prev.filter(p => !p.seleccionado));
  };

  const handleSeleccionar = (id: string) => {
    setPeriodos(prev =>
      prev.map(p =>
        p.id === id ? { ...p, seleccionado: !p.seleccionado } : p
      )
    );
  };

  const resultados = periodos.filter((p) => {
    const query = search.toLowerCase();
    const coincideBusqueda =
      p.plantel_nombre.toLowerCase().includes(query) ||
      p.tipo_periodo.toLowerCase().includes(query) ||
      p.concatenado.toLowerCase().includes(query);

    const coincidePlantel =
      filtroPlantel === 'Todos' || p.plantel_nombre === filtroPlantel;

    return coincideBusqueda && coincidePlantel;
  });

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-800 mb-4">
        Listado de periodos de pago
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por plantel, tipo de periodo o resumen..."
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
              <SelectItem key={p.id} value={p.nombre}>
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
          Agregar periodo
        </Button>

        <Button
          className="bg-red-600 text-white flex items-center gap-2 whitespace-nowrap"
          onClick={handleEliminarSeleccionados}
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
              <th className="p-3 text-center text-nowrap">Inicio del periodo</th>
              <th className="p-3 text-center text-nowrap">Fin del periodo</th>
              <th className="p-3 text-center text-nowrap">Tipo de periodo</th>
              <th className="p-3 text-center text-nowrap">Resumen</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No hay periodos de pago registrados...
                </td>
              </tr>
            ) : (
              resultados.map((periodo) => (
                <tr key={periodo.id} className="border-t">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={periodo.seleccionado}
                      onChange={() => handleSeleccionar(periodo.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">{periodo.plantel_nombre}</td>
                  <td className="p-3 text-center text-nowrap">{formatearFecha(periodo.inicio_periodo)}</td>
                  <td className="p-3 text-center text-nowrap">{formatearFecha(periodo.fin_periodo)}</td>
                  <td className="p-3 text-center text-nowrap">{periodo.tipo_periodo}</td>
                  <td className="p-3 text-center text-nowrap">{periodo.concatenado}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-yellow-400 hover:bg-yellow-400 text-white p-2 rounded"
                        onClick={() => handleEditar(periodo.id)}
                        title="Editar"
                      >
                        <Edit2 size={20} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-red-600 hover:bg-red-700 p-2 rounded text-white"
                        onClick={() => handleEliminar(periodo.id)}
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

export default PeriodoPagoList;
