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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Plantel {
  id: string;      // UUID
  nombre: string;
  seleccionado: boolean;
}

const PlantelList: React.FC = () => {
  const [planteles, setPlanteles] = useState<Plantel[]>([]);
  const [search, setSearch] = useState('');
  const [filtroPlantel, setFiltroPlantel] = useState<string>('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 7;

  const supabase = createClientComponentClient();
  const router = useRouter();
  const { rol } = useAuth();

  // ================================
  // 🔹 CARGAR PLANTELES
  // ================================
  useEffect(() => {
    const fetchPlanteles = async () => {
      const { data, error } = await supabase
        .from('plantel')
        .select('id, nombre_plantel');

      if (error) {
        toast.error("Error al obtener los planteles.");
        return;
      }

      const plantelesMapeados = (data ?? []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre_plantel,
        seleccionado: false,
      }));

      setPlanteles(plantelesMapeados);
    };

    fetchPlanteles();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [search, filtroPlantel]);

  // ================================
  // 🔹 NAVEGACIÓN
  // ================================
  const handleAgregar = () => router.push('/planteles/registro');
  const handleEditar = (id: string) => router.push(`/planteles/editar/${id}`);

  // ================================
  // 🔥 ELIMINAR UN SOLO PLANTEL
  // ================================
  const handleEliminar = async (id: string): Promise<void> => {
    if (rol !== "Administrador") {
      toast.warning("Solo los administradores pueden eliminar registros");
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Deseas eliminar este plantel?",
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
      .from("plantel")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("No se pudo eliminar el plantel.");
      return;
    }

    setPlanteles(prev => prev.filter(p => p.id !== id));

    toast.success("Plantel eliminado correctamente.");
  };

  // ================================
  // 🔥 ELIMINAR SELECCIONADOS
  // ================================
  const handleEliminarSeleccionados = async (): Promise<void> => {
    if (rol !== "Administrador") {
      toast.warning("Solo los administradores pueden eliminar registros.");
      return;
    }

    const idsAEliminar = planteles
      .filter(p => p.seleccionado)
      .map(p => p.id);

    if (idsAEliminar.length === 0) {
      toast.info("No hay registros seleccionados.");
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Eliminar registros seleccionados?",
      text: "Se eliminarán múltiples registros permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    const { error } = await supabase
      .from("plantel")
      .delete()
      .in("id", idsAEliminar);

    if (error) {
      toast.error("No se pudieron eliminar los registros.");
      return;
    }

    setPlanteles(prev => prev.filter(p => !p.seleccionado));

    toast.success("Planteles eliminados correctamente.");
  };

  // ================================
  // FILTROS Y BÚSQUEDA
  // ================================
  const resultadosFiltrados = planteles.filter(o => {
    const coincideNombre = o.nombre.toLowerCase().includes(search.toLowerCase());
    const coincidePlantel =
      filtroPlantel === "Todos" || o.id === filtroPlantel;

    return coincideNombre && coincidePlantel;
  });

  const totalPaginas = Math.ceil(resultadosFiltrados.length / registrosPorPagina);

  const resultadosPaginados = resultadosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const handleSeleccionar = (id: string) => {
    setPlanteles(prev =>
      prev.map(p =>
        p.id === id ? { ...p, seleccionado: !p.seleccionado } : p
      )
    );
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="p-8 bg-gray-50 max-h-screen">

      <ToastContainer position="top-right" autoClose={2000} />

      <h1 className="text-3xl font-light text-center mb-6">
        Listado de planteles
      </h1>

      {/* BUSCADOR Y SELECT */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre de plantel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />

        <Select onValueChange={setFiltroPlantel} value={filtroPlantel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos los planteles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos los planteles</SelectItem>
            {planteles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* BOTONES */}
      <div className="flex gap-2 mb-4">
        <Button className="bg-green-600 text-white" onClick={handleAgregar}>
          Agregar plantel
        </Button>

        <Button
          className={`bg-red-600 text-white ${rol !== "Administrador" ? "opacity-50" : ""}`}
          onClick={handleEliminarSeleccionados}
        >
          Eliminar seleccionados
        </Button>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-3 w-10"></th>
              <th className="p-3 text-center">Nombre del plantel</th>
              <th className="p-3 text-center">Acciones</th>
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
              resultadosPaginados.map((plantel) => (
                <tr key={plantel.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={plantel.seleccionado}
                      onChange={() => handleSeleccionar(plantel.id)}
                    />
                  </td>

                  <td className="p-3 text-center">{plantel.nombre}</td>

                  <td className="p-3 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-yellow-400"
                      onClick={() => handleEditar(plantel.id)}
                    >
                      <Edit2 size={20} />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className={`text-red-600 ${rol !== "Administrador" ? "opacity-50" : ""}`}
                      onClick={() => handleEliminar(plantel.id)}
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

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex justify-center mt-6 gap-1">
          <button
            onClick={() => setPaginaActual(p => Math.max(p - 1, 1))}
            disabled={paginaActual === 1}
            className="px-3 py-1 border rounded"
          >
            ←
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              onClick={() => setPaginaActual(i + 1)}
              className={`px-3 py-1 border rounded ${
                paginaActual === i + 1
                  ? "bg-blue-600 text-white"
                  : "text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPaginaActual(p => Math.min(p + 1, totalPaginas))}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 border rounded"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default PlantelList;
