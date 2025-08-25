'use client';

import React, { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
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
import { useAuth } from '@/app/context/auth-context'; 
interface Plantel {
  id: string;
  nombre_plantel: string;
}

interface OfertaEducativa {
  id: string;
  nombre_oferta: string;
}

interface Asignatura {
  id: string;
  nombre_asignatura: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  plantel: Plantel | null;
  oferta_educativa: OfertaEducativa | null;
  seleccionado: boolean;
}

const AsignaturaList: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { rol } = useAuth();

  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [filtroPlantel, setFiltroPlantel] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  useEffect(() => {
    fetchPlanteles();
    fetchAsignaturas();
  }, []);

  const fetchPlanteles = async () => {
    const { data, error } = await supabase
      .from("plantel")
      .select("id, nombre_plantel");

    if (error) {
      console.error("Error al obtener planteles:", error.message);
    } else if (data) {
      setPlanteles(data);
    }
  };

  const fetchAsignaturas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("asignatura")
      .select(`
        id,
        nombre_asignatura,
        fecha_inicio,
        fecha_fin,
        plantel (id, nombre_plantel),
        oferta_educativa (id, nombre_oferta)
      `);

    if (error) {
      console.error("Error al obtener asignaturas:", error);
    } else if (data) {
      const asignaturasConSeleccion = data.map((a: any) => ({
        id: a.id,
        nombre_asignatura: a.nombre_asignatura,
        fecha_inicio: a.fecha_inicio,
        fecha_fin: a.fecha_fin,
        plantel: a.plantel || null,
        oferta_educativa: a.oferta_educativa || null,
        seleccionado: false,
      }));
      setAsignaturas(asignaturasConSeleccion);
    }
    setLoading(false);
  };

  const handleSeleccionar = (id: string) => {
    setAsignaturas((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, seleccionado: !a.seleccionado } : a
      )
    );
  };

  const handleAgregar = () => {
    router.push('/modulos/registro');
  };

  const handleEditar = (id: string) => {
    router.push(`/modulos/editar/${id}`);
  };

  const handleEliminar = async (id: string) => {
    if (rol !== 'Administrador') return;

    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otros registros en el sistema. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('asignatura').delete().eq('id', id);

    if (error) {
      console.error('Error eliminando el módulo:', error.message);
      alert('Error al eliminar el módulo.');
      return;
    }

    setAsignaturas(prev => prev.filter(a => a.id !== id));
  };

  const handleEliminarSeleccionados = async () => {
    if (rol !== 'Administrador') return;

    const seleccionados = asignaturas.filter(a => a.seleccionado).map(a => a.id);

    if (seleccionados.length === 0) {
      alert('No hay módulos seleccionados para eliminar.');
      return;
    }

    const confirmado = window.confirm(
      '¡Espera! La acción es irreversible y podrá afectar otros registros en el sistema. ¿Deseas continuar?'
    );
    if (!confirmado) return;

    const { error } = await supabase.from('asignatura').delete().in('id', seleccionados);

    if (error) {
      console.error('Error eliminando los módulos seleccionados:', error.message);
      alert('Error al eliminar los módulos seleccionados.');
      return;
    }

    setAsignaturas(prev => prev.filter(a => !a.seleccionado));
  };

  const resultados = asignaturas.filter((a) => {
    const coincideNombre = a.nombre_asignatura.toLowerCase().includes(search.toLowerCase());
    const coincidePlantel =
      filtroPlantel === "Todos" || a.plantel?.id === filtroPlantel;
    return coincideNombre && coincidePlantel;
  });

  const totalPaginas = Math.ceil(resultados.length / registrosPorPagina);
  const resultadosPaginados = resultados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-light text-center text-black-800 mb-6">
        Listado de Módulos
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre del módulo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select onValueChange={setFiltroPlantel} value={filtroPlantel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por plantel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los planteles</SelectItem>
            {planteles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre_plantel}
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
          Agregar módulo
        </Button>

        <Button
          className={`bg-red-600 text-white flex items-center gap-2 whitespace-nowrap
            ${rol !== 'Administrador' ? 'opacity-50 pointer-events-auto' : ''}
          `}
          onClick={handleEliminarSeleccionados}
          title={
            rol !== 'Administrador'
              ? 'Función disponible únicamente para administradores'
              : 'Eliminar seleccionados'
          }
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
              <th className="p-3 text-center text-nowrap">Oferta educativa asociada</th>
              <th className="p-3 text-center text-nowrap">Nombre del módulo</th>
              <th className="p-3 text-center text-nowrap">Fecha de inicio del módulo</th>
              <th className="p-3 text-center text-nowrap">Fecha de fin del módulo</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : resultadosPaginados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No hay módulos registrados...
                </td>
              </tr>
            ) : (
              resultadosPaginados.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={a.seleccionado}
                      onChange={() => handleSeleccionar(a.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">
                    {a.plantel?.nombre_plantel || "Sin plantel"}
                  </td>
                  <td className="p-3 text-center text-nowrap">
                    {a.oferta_educativa?.nombre_oferta || "Sin oferta educativa"}
                  </td>
                  <td className="p-3 text-center text-nowrap">{a.nombre_asignatura}</td>
                  <td className="p-3 text-center text-nowrap">
                    {a.fecha_inicio
                      ? new Date(a.fecha_inicio).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="p-3 text-center text-nowrap">
                    {a.fecha_fin
                      ? new Date(a.fecha_fin).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-yellow-400"
                      onClick={() => handleEditar(a.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className={`text-red-600 cursor-pointer
                        ${rol !== 'Administrador' ? 'opacity-50 pointer-events-auto' : ''}
                      `}
                      onClick={() => rol === 'Administrador' && handleEliminar(a.id)}
                      title={
                        rol !== 'Administrador'
                          ? 'Función disponible únicamente para administradores'
                          : 'Eliminar'
                      }
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

export default AsignaturaList;
