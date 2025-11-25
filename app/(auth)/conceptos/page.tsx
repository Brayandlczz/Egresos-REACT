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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ConceptoPago {
  id: number;
  descripcion: string;
  plantel_id: number | null;
  nombre_plantel: string | null;
  seleccionado: boolean;
}

interface Plantel {
  id: number;
  nombre: string;
}

const ConceptosPagoList = () => {
  const [conceptos, setConceptos] = useState<ConceptoPago[]>([]);
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [filtroPlantel, setFiltroPlantel] = useState('Todos');
  const [search, setSearch] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const supabase = createClientComponentClient();
  const router = useRouter();
  const { rol } = useAuth();

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
        toast.error("Error al obtener los conceptos.");
        return;
      }

      const conceptosMapeados: ConceptoPago[] = (data ?? []).map((c: any) => ({
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
        toast.error("Error al obtener planteles.");
        return;
      }

      const plantelesMapeados: Plantel[] = (data ?? []).map((p: any) => ({
        id: p.id, 
        nombre: p.nombre_plantel,
      }));

      setPlanteles(plantelesMapeados);
    };

    fetchConceptos();
    fetchPlanteles();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [search, filtroPlantel]);

  const handleAgregar = () => router.push('/conceptos/registro');
  const handleEditar = (id: number) => router.push(`/conceptos/editar/${id}`);

  const handleEliminar = async (id: number) => {
    if (rol !== "Administrador") {
      toast.warning("Solo los administradores pueden eliminar registros.");
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Deseas eliminar este concepto?",
      text: "Esta acción es irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    const { error } = await supabase
      .from("concepto_pago")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("No se pudo eliminar el concepto.");
      return;
    }

    setConceptos(prev => prev.filter(c => c.id !== id));

    toast.success("Concepto eliminado correctamente.");
  };

  const handleEliminarSeleccionados = async () => {
    if (rol !== 'Administrador') {
      toast.warning("Solo los administradores pueden eliminar registros.");
      return;
    }

    const idsAEliminar = conceptos
      .filter(c => c.seleccionado)
      .map(c => c.id);

    if (idsAEliminar.length === 0) {
      toast.info("No hay registros seleccionados.");
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Eliminar registros seleccionados?",
      text: "Se eliminarán varios registros permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (!confirm.isConfirmed) return;

    const { error } = await supabase
      .from('concepto_pago')
      .delete()
      .in('id', idsAEliminar);

    if (error) {
      toast.error("No se pudieron eliminar los registros.");
      return;
    }

    setConceptos(prev => prev.filter(c => !c.seleccionado));
    toast.success("Conceptos eliminados correctamente.");
  };

  const handleSeleccionar = (id: number) => {
    setConceptos(prev =>
      prev.map(c =>
        c.id === id ? { ...c, seleccionado: !c.seleccionado } : c
      ),
    );
  };

  const resultadosFiltrados = conceptos.filter(c => {
    const coincideBusqueda = c.descripcion.toLowerCase().includes(search.toLowerCase());
    const coincidePlantel = filtroPlantel === 'Todos' || c.plantel_id === Number(filtroPlantel);
    return coincideBusqueda && coincidePlantel;
  });

  const totalPaginas = Math.ceil(resultadosFiltrados.length / registrosPorPagina);
  const resultadosPaginados = resultadosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  return (
    <div className="p-8 bg-gray-50 max-h-screen">

      <ToastContainer position="top-right" autoClose={2000} />

      <h1 className="text-3xl font-light text-center text-black-800 mb-6">
        Listado de conceptos de pago
      </h1>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre..."
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
              <SelectItem key={p.id} value={String(p.id)}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto">
        <Button className="bg-green-600 text-white" onClick={handleAgregar}>
          Agregar concepto
        </Button>

        <Button
          className={`bg-red-600 text-white
            ${rol !== 'Administrador' ? 'opacity-50' : ''} `}
          onClick={handleEliminarSeleccionados}
        >
          Eliminar seleccionados
        </Button>
      </div>

      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-center">Plantel</th>
              <th className="p-3 text-center">Descripción</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {resultadosPaginados.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No hay conceptos registrados...
                </td>
              </tr>
            ) : (
              resultadosPaginados.map(concepto => (
                <tr key={concepto.id} className="border-t hover:bg-gray-50">
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

                  <td className="p-3 text-center text-nowrap">
                    {concepto.descripcion}
                  </td>

                  <td className="p-3 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-yellow-400"
                      onClick={() => handleEditar(concepto.id)}
                    >
                      <Edit2 size={20} />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className={`text-red-600 ${rol !== 'Administrador' ? 'opacity-50' : ''}`}
                      onClick={() => handleEliminar(concepto.id)}
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
            className="px-3 py-1 text-sm rounded-md border border-gray-300"
          >
            ←
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPaginaActual(i + 1)}
              className={`px-3 py-1 text-sm rounded-md border ${
                paginaActual === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 text-sm rounded-md border border-gray-300"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default ConceptosPagoList;
