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

interface CuentaBancaria {
  id: number;
  banco: string;
  numero_cuenta: string;
  razon_social: string;
  plantel: string;
  seleccionado: boolean;
}

interface Plantel {
  id: number;
  nombre_plantel: string;
}

const CuentasBancariasList: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [search, setSearch] = useState('');
  const [filtroPlantel, setFiltroPlantel] = useState<string>('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const cuentasPorPagina = 10;

  useEffect(() => {
    const fetchPlanteles = async () => {
      const { data, error } = await supabase.from('plantel').select('id, nombre_plantel');
      if (error) {
        console.error('Error al obtener planteles:', error.message);
        return;
      }
      setPlanteles(data);
    };
    fetchPlanteles();
  }, []);

  useEffect(() => {
    const fetchCuentas = async () => {
      const { data, error } = await supabase
        .from('cuenta_banco')
        .select(`
          id,
          banco,
          numero_cuenta,
          razon_social,
          plantel (
            nombre_plantel
          )
        `);

      if (error) {
        console.error('Error cargando cuentas bancarias:', error.message);
        return;
      }

      if (data) {
        const mapeado = data.map((c: any) => ({
          id: c.id,
          banco: c.banco,
          numero_cuenta: c.numero_cuenta,
          razon_social: c.razon_social,
          plantel: c.plantel?.nombre_plantel || 'Sin plantel',
          seleccionado: false,
        }));
        setCuentas(mapeado);
      }
    };

    fetchCuentas();
  }, [supabase]);

  const handleAgregar = () => router.push('/cuentas/registro');
  const handleEditar = (id: number) => router.push(`/cuentas/editar/${id}`);

  const handleEliminar = async (id: number) => {
    const confirmar = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );

    if (!confirmar) return;

    const { error } = await supabase.from('cuenta_banco').delete().eq('id', id);
    if (error) {
      console.error('Error al eliminar la cuenta:', error.message);
      return;
    }

    setCuentas(prev => prev.filter(c => c.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    const idsAEliminar = cuentas.filter(c => c.seleccionado).map(c => c.id);

    if (idsAEliminar.length === 0) return;

    const confirmar = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otras funcionalidades. ¿Deseas continuar?'
    );

    if (!confirmar) return;

    const { error } = await supabase.from('cuenta_banco').delete().in('id', idsAEliminar);
    if (error) {
      console.error('Error al eliminar cuentas seleccionadas:', error.message);
      return;
    }

    setCuentas(prev => prev.filter(c => !c.seleccionado));
  };

  const handleSeleccionar = (id: number) => {
    setCuentas(prev =>
      prev.map(c =>
        c.id === id ? { ...c, seleccionado: !c.seleccionado } : c
      )
    );
  };

  const resultados = cuentas.filter(c => {
    const query = search.toLowerCase();
    const coincideBusqueda =
      c.banco.toLowerCase().includes(query) ||
      c.razon_social.toLowerCase().includes(query) ||
      c.plantel.toLowerCase().includes(query);

    const coincidePlantel =
      filtroPlantel === 'Todos' || c.plantel === planteles.find(p => p.id.toString() === filtroPlantel)?.nombre_plantel;

    return coincideBusqueda && coincidePlantel;
  });

  const totalPaginas = Math.ceil(resultados.length / cuentasPorPagina);
  const cuentasPaginadas = resultados.slice(
    (paginaActual - 1) * cuentasPorPagina,
    paginaActual * cuentasPorPagina
  );

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-light text-center text-black-800 mb-6">Listado de Cuentas Bancarias</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por plantel o nombre de dependencia bancaria..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select onValueChange={setFiltroPlantel} value={filtroPlantel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los planteles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los planteles</SelectItem>
            {planteles.map((plantel) => (
              <SelectItem key={plantel.id} value={plantel.id.toString()}>
                {plantel.nombre_plantel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-nowrap gap-2 mb-6 overflow-x-auto">
        <Button
          className="bg-green-600 text-white text-nowrap px-4 py-2 rounded flex items-center gap-2"
          onClick={handleAgregar}
        >
          Agregar cuenta
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
              <th className="p-3 text-center text-nowrap">Dependencia bancaria</th>
              <th className="p-3 text-center text-nowrap">Número de cuenta</th>
              <th className="p-3 text-center text-nowrap">Razón social</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentasPaginadas.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No hay cuentas bancarias registradas...
                </td>
              </tr>
            ) : (
              cuentasPaginadas.map(cuenta => (
                <tr key={cuenta.id} className="border-t">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={cuenta.seleccionado}
                      onChange={() => handleSeleccionar(cuenta.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">{cuenta.plantel}</td>
                  <td className="p-3 text-center text-nowrap">{cuenta.banco}</td>
                  <td className="p-3 text-center text-nowrap">{cuenta.numero_cuenta}</td>
                  <td className="p-3 text-center text-nowrap">{cuenta.razon_social}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-yellow-400"
                        onClick={() => handleEditar(cuenta.id)}
                        title="Editar"
                      >
                        <Edit2 size={20} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleEliminar(cuenta.id)}
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

export default CuentasBancariasList;
