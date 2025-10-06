"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ThreeDot } from "react-loading-indicators";

type UUID = string;

interface PlantelOpt {
  id: UUID;
  nombre_plantel: string;
}

const EditarSucursal: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();

  const sucursalId = Array.isArray(params?.id) ? (params.id[0] as UUID) : (params?.id as UUID | undefined);

  const [planteles, setPlanteles] = useState<PlantelOpt[]>([]);
  const [plantelId, setPlantelId] = useState<UUID>("" as UUID);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPlanteles = async () => {
      const { data, error } = await supabase
        .from("plantel")
        .select("id, nombre_plantel")
        .order("nombre_plantel", { ascending: true });

      if (error) {
        console.error("Error al cargar planteles:", error.message);
        alert("Error al cargar la lista de planteles.");
        return;
      }

      setPlanteles(data || []);
    };

    fetchPlanteles();
  }, [supabase]);

  useEffect(() => {
    if (!sucursalId) return;

    const fetchSucursal = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("sucursales")
        .select(
          `
          id,
          nombre,
          plantel_id,
          plantel:plantel_id ( id, nombre_plantel )
        `
        )
        .eq("id", sucursalId)
        .single();

      setLoading(false);

      if (error || !data) {
        console.error("Error al cargar sucursal:", error?.message);
        alert("Error al cargar datos de la sucursal.");
        router.push("/sucursales");
        return;
      }

      setNombre(data.nombre ?? "");
      setPlantelId(data.plantel_id ?? "");
    };

    fetchSucursal();
  }, [sucursalId, supabase, router]);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      alert("Debe ingresar el nombre de la sucursal.");
      return;
    }
    if (!plantelId) {
      alert("Debe seleccionar el plantel.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("sucursales")
      .update({
        nombre: nombre.trim(),
        plantel_id: plantelId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sucursalId);

    setLoading(false);

    if (error) {
      console.error("Error actualizando la sucursal:", error);
      alert("Error actualizando la sucursal: " + JSON.stringify(error));
      return;
    }

    setSuccessMessage("¡Sucursal actualizada con éxito!");
    setTimeout(() => {
      router.push("/sucursales");
    }, 1500);
  };

  const handleCancelar = () => {
    router.push("/sucursales");
  };

  return (
    <div className="relative p-8 bg-white-100 max-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <ThreeDot color="#2464ec" size="large" text="" textColor="" />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded shadow">
          {successMessage}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">
        <span className="font-bold text-black">Sucursales</span> | Editar sucursal
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Datos de la sucursal a editar
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-2 font-medium">Nombre de la sucursal:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Plantel:</label>
            <select
              value={plantelId}
              onChange={(e) => setPlantelId(e.target.value as UUID)}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="">-- Seleccione un plantel --</option>
              {planteles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre_plantel}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end items-center gap-2 pt-2">
            <button
              onClick={handleCancelar}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-60"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
              disabled={loading}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarSucursal;
