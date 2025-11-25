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
import { useAuth } from '@/app/context/auth-context';

import Swal from "sweetalert2";

interface Docente {
  relacion_id: string;
  id: number;
  nombre_docente: string;
  importe_pago: number;
  plantel_id: number | null;
  nombre_plantel: string | null;
  periodo_pago_id: number | null;
  periodo_pago_concatenado: string | null;
  asignatura_id: number | null;
  nombre_asignatura: string | null;
  seleccionado: boolean;
}

interface Plantel {
  id: number;
  nombre: string;
}

const DocentesList = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [filtroPlantel, setFiltroPlantel] = useState('Todos');
  const [search, setSearch] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const docentesPorPagina = 10;

  const supabase = createClientComponentClient();
  const router = useRouter();
  const { rol } = useAuth();

  useEffect(() => {
    const fetchDocentes = async () => {
      const { data, error } = await supabase
        .from('docente_relations')
        .select(`
          id,
          plantel_id,
          importe_total_pago,
          docente (
            id,
            nombre_docente
          ),
          plantel (
            id,
            nombre_plantel
          ),
          asignatura (
            id,
            nombre_asignatura
          ),
          periodo_pago (
            id,
            concatenado
          )
        `);

      if (error) {
        console.error('Error al obtener docentes:', error.message);
        return;
      }

      const docentesMapeados = (data ?? []).map((rel: any) => ({
        relacion_id: rel.id.toString(),
        id: rel.docente.id,
        nombre_docente: rel.docente.nombre_docente,
        plantel_id: rel.plantel_id,
        nombre_plantel: rel.plantel?.nombre_plantel ?? 'Sin plantel',
        asignatura_id: rel.asignatura?.id ?? null,
        nombre_asignatura: rel.asignatura?.nombre_asignatura ?? 'Sin asignatura',
        periodo_pago_id: rel.periodo_pago?.id ?? null,
        periodo_pago_concatenado: rel.periodo_pago?.concatenado ?? 'Sin periodo',
        importe_pago: rel.importe_total_pago ?? 0,
        seleccionado: false,
      }));

      setDocentes(docentesMapeados);
    };

    const fetchPlanteles = async () => {
      const { data, error } = await supabase
        .from('plantel')
        .select('id, nombre_plantel');

      if (error) {
        console.error('Error al obtener planteles:', error.message);
        return;
      }

      const plantelesMapeados = (data ?? []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre_plantel,
      }));

      setPlanteles(plantelesMapeados);
    };

    fetchDocentes();
    fetchPlanteles();
  }, [supabase]);

  const handleSeleccionar = (id: number) => {
    setDocentes(prev =>
      prev.map(d =>
        d.id === id ? { ...d, seleccionado: !d.seleccionado } : d
      )
    );
  };

const handleEliminarSeleccionados = async () => {
  if (rol !== 'Administrador') return;

  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar docentes seleccionados?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: "#3085d6",
  });

  if (!isConfirmed) return;

  const idsAEliminar = docentes
    .filter(d => d.seleccionado)
    .map(d => d.relacion_id);

  if (idsAEliminar.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Sin selección',
      text: 'No hay docentes seleccionados para eliminar.'
    });
    return;
  }

  const { error } = await supabase
    .from('docente_relations')
    .delete()
    .in('id', idsAEliminar);

  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: error.message
    });
    return;
  }

  setDocentes(prev =>
    prev.filter(d => !idsAEliminar.includes(d.relacion_id))
  );

  Swal.fire({
    icon: 'success',
    title: 'Eliminado',
    text: 'Los docentes seleccionados fueron eliminados correctamente.'
  });
};

  const handleEditar = (id: number) => {
    router.push(`/docentes/editar/${id}`);
  };

const handleEliminar = async (relacion_id: string) => {
  if (rol !== 'Administrador') return;

  const { isConfirmed } = await Swal.fire({
    title: '¿Eliminar docente?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: "#3085d6",
  });

  if (!isConfirmed) return;

  const { error } = await supabase
    .from('docente_relations')
    .delete()
    .eq('id', relacion_id);

  if (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error al eliminar',
      text: error.message
    });
    return;
  }

  setDocentes(prev => prev.filter(d => d.relacion_id !== relacion_id));

  Swal.fire({
    icon: 'success',
    title: 'Eliminado',
    text: 'El docente fue eliminado correctamente.'
  });
};

  const resultados = docentes.filter(d => {
    const coincideBusqueda = d.nombre_docente.toLowerCase().includes(search.toLowerCase());
    const coincidePlantel =
      filtroPlantel === 'Todos' || d.plantel_id?.toString() === filtroPlantel;
    return coincideBusqueda && coincidePlantel;
  });

  const totalPaginas = Math.ceil(resultados.length / docentesPorPagina);
  const docentesPaginados = resultados.slice(
    (paginaActual - 1) * docentesPorPagina,
    paginaActual * docentesPorPagina
  );

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-light text-center text-black-800 mb-6">Listado de docentes</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre del docente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w"
        />

        <Select onValueChange={setFiltroPlantel} value={filtroPlantel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por plantel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los planteles</SelectItem>
            {planteles.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto">
        <Button
          className="bg-green-600 text-white flex items-center gap-2 whitespace-nowrap"
          onClick={() => router.push('/docentes/registro')}
        >
          Agregar docente
        </Button>

        <Button
          className={`bg-red-600 text-white flex items-center gap-2 whitespace-nowrap ${
            rol !== 'Administrador' ? 'opacity-50 pointer-events-none' : ''
          }`}
          onClick={handleEliminarSeleccionados}
          title={
            rol !== 'Administrador'
              ? 'Función disponible solo para administradores'
              : 'Eliminar seleccionados'
          }
        >
          Eliminar seleccionados
        </Button>

        <Button
          className="bg-yellow-600 text-white flex items-center gap-2 whitespace-nowrap"
          onClick={() => router.push('/constancias')}
        >
          Constancia de Servicios
        </Button>
      </div>

      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 text-left"></th>
              <th className="p-3 text-center text-nowrap">Plantel asociado</th>
              <th className="p-3 text-center text-nowrap">Nombre del docente</th>
              <th className="p-3 text-center text-nowrap">Asignatura que imparte</th>
              <th className="p-3 text-center text-nowrap">Periodo de pago</th>
              <th className="p-3 text-center text-nowrap">Importe total de pago</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docentesPaginados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No hay docentes registrados...
                </td>
              </tr>
            ) : (
              docentesPaginados.map(docente => (
                <tr key={docente.relacion_id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={docente.seleccionado}
                      onChange={() => handleSeleccionar(docente.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">{docente.nombre_plantel}</td>
                  <td className="p-3 text-center text-nowrap">{docente.nombre_docente}</td>
                  <td className="p-3 text-center text-nowrap">{docente.nombre_asignatura}</td>
                  <td className="p-3 text-center text-nowrap">{docente.periodo_pago_concatenado}</td>
                  <td className="p-3 text-center text-nowrap">${docente.importe_pago.toFixed(2)}</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-yellow-400"
                      onClick={() => handleEditar(docente.id)}
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`text-red-600 ${
                        rol !== 'Administrador' ? 'opacity-50 pointer-events-none' : ''
                      }`}
                      onClick={() => rol === 'Administrador' && handleEliminar(docente.relacion_id)}
                      title={
                        rol !== 'Administrador'
                          ? 'Función disponible solo para administradores'
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

export default DocentesList;
