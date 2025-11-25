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
import { useAuth } from '@/app/context/auth-context'; 

import Swal from "sweetalert2";

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
  const { rol } = useAuth(); 
  const [periodos, setPeriodos] = useState<PeriodoPago[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [search, setSearch] = useState('');
  const [filtroPlantel, setFiltroPlantel] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const periodosPorPagina = 7;

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
      const { data, error } = await supabase.from('plantel').select('id, nombre_plantel');

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
    return fecha.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleAgregar = () => router.push('/periodos/registro');
  const handleEditar = (id: string) => router.push(`/periodos/editar/${id}`);

const handleEliminar = async (id: string) => {
  if (rol !== 'Administrador') {
    Swal.fire({
      icon: "warning",
      title: "Acceso restringido",
      text: "Solo los administradores pueden eliminar registros.",
    });
    return;
  }

  const confirm = await Swal.fire({
    title: "¿Deseas eliminar este periodo de pago?",
    text: "Esta acción es irreversible y puede afectar otros registros del sistema.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  const { error } = await supabase.from('periodo_pago').delete().eq('id', id);

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo eliminar el periodo de pago.",
    });
    return;
  }

  setPeriodos(prev => prev.filter(p => p.id !== id));

  Swal.fire({
    icon: "success",
    title: "Eliminado",
    text: "El periodo se eliminó correctamente.",
    timer: 1500,
    showConfirmButton: false,
  });
};


const handleEliminarSeleccionados = async () => {
  if (rol !== 'Administrador') {
    Swal.fire({
      icon: "warning",
      title: "Acceso restringido",
      text: "Solo los administradores pueden eliminar registros.",
    });
    return;
  }

  const idsAEliminar = periodos.filter(p => p.seleccionado).map(p => p.id);

  if (idsAEliminar.length === 0) {
    Swal.fire({
      icon: "info",
      title: "Sin selección",
      text: "No hay periodos seleccionados para eliminar.",
    });
    return;
  }

  const confirm = await Swal.fire({
    title: "¿Eliminar periodos seleccionados?",
    text: "Esta acción es irreversible y eliminará múltiples registros.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (!confirm.isConfirmed) return;

  const { error } = await supabase
    .from('periodo_pago')
    .delete()
    .in('id', idsAEliminar);

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron eliminar los periodos seleccionados.",
    });
    return;
  }

  setPeriodos(prev => prev.filter(p => !p.seleccionado));

  Swal.fire({
    icon: "success",
    title: "Registros eliminados",
    text: "Los periodos seleccionados se eliminaron correctamente.",
    timer: 1500,
    showConfirmButton: false,
  });
};


  const handleSeleccionar = (id: string) => {
    setPeriodos(prev =>
      prev.map(p => (p.id === id ? { ...p, seleccionado: !p.seleccionado } : p))
    );
  };

  const resultados = periodos.filter(p => {
    const query = search.toLowerCase();
    const coincideBusqueda =
      p.plantel_nombre.toLowerCase().includes(query) ||
      p.tipo_periodo.toLowerCase().includes(query) ||
      p.concatenado.toLowerCase().includes(query);

    const coincidePlantel = filtroPlantel === 'Todos' || p.plantel_nombre === filtroPlantel;
    return coincideBusqueda && coincidePlantel;
  });

  const totalPaginas = Math.ceil(resultados.length / periodosPorPagina);
  const periodosPaginados = resultados.slice(
    (paginaActual - 1) * periodosPorPagina,
    paginaActual * periodosPorPagina
  );

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="p-8 bg-gray-50 max-h-screen">
      <h1 className="text-3xl font-light text-center mb-6">Listado de periodos de pago</h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por tipo de periodo de pago o resumen..."
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

      <div className="flex gap-2 mb-4 overflow-x-auto">
        <Button
          className="bg-green-600 text-white flex items-center gap-2"
          onClick={handleAgregar}
        >
          Agregar periodo
        </Button>
        <Button
          className={`bg-red-600 text-white flex items-center gap-2
            ${rol !== 'Administrador' ? 'opacity-50 pointer-events-auto' : ''}`}
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
              <th className="p-3"></th>
              <th className="p-3 text-center">Plantel</th>
              <th className="p-3 text-center text-nowrap">Inicio del periodo</th>
              <th className="p-3 text-center text-nowrap">Fin del periodo</th>
              <th className="p-3 text-center text-nowrap">Tipo de periodo</th>
              <th className="p-3 text-center text-nowrap">Resumen</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {periodosPaginados.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No hay periodos registrados...
                </td>
              </tr>
            ) : (
              periodosPaginados.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.seleccionado}
                      onChange={() => handleSeleccionar(p.id)}
                    />
                  </td>
                  <td className="p-3 text-center text-nowrap">{p.plantel_nombre}</td>
                  <td className="p-3 text-center text-nowrap">{formatearFecha(p.inicio_periodo)}</td>
                  <td className="p-3 text-center text-nowrap">{formatearFecha(p.fin_periodo)}</td>
                  <td className="p-3 text-center text-nowrap">{p.tipo_periodo}</td>
                  <td className="p-3 text-center text-nowrap">{p.concatenado}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-yellow-400"
                        onClick={() => handleEditar(p.id)}
                        title="Editar"
                      >
                        <Edit2 size={20} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`text-red-600 ${rol !== 'Administrador' ? 'opacity-50 pointer-events-auto' : ''}`}
                        onClick={() => rol === 'Administrador' && handleEliminar(p.id)}
                        title={
                          rol !== 'Administrador'
                            ? 'Función disponible únicamente para administradores'
                            : 'Eliminar'
                        }
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
            className="px-3 py-1 text-sm border rounded-md"
          >
            ←
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => cambiarPagina(i + 1)}
              className={`px-3 py-1 text-sm border rounded-md ${
                paginaActual === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 text-sm border rounded-md"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default PeriodoPagoList;
