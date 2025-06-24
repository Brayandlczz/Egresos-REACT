"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Atom } from "react-loading-indicators";

const RegistroPeriodoPago: React.FC = () => {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [planteles, setPlanteles] = useState<any[]>([]);
  const [plantelId, setPlantelId] = useState("");
  const [inicioPeriodo, setInicioPeriodo] = useState("");
  const [finPeriodo, setFinPeriodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const cargarPlanteles = async () => {
      const { data, error } = await supabase
        .from("plantel")
        .select("id, nombre_plantel")
        .order("nombre_plantel", { ascending: true });

      if (error) console.error("Error cargando planteles:", error);
      else setPlanteles(data);
    };

    cargarPlanteles();
  }, []);

  const deducirTipoPeriodo = (inicio: Date, fin: Date): string => {
    const diffMeses =
      fin.getMonth() - inicio.getMonth() +
      12 * (fin.getFullYear() - inicio.getFullYear());

    if (diffMeses <= 1) return "Mensual";
    if (diffMeses <= 2) return "Bimestral";
    if (diffMeses <= 3) return "Trimestral";
    if (diffMeses <= 4) return "Cuatrimestral";
    if (diffMeses <= 6) return "Semestral";
    if (diffMeses <= 12) return "Anual";
    return "Otro";
  };

  const generarConcatenado = (inicio: Date, fin: Date): string => {
    const inicioFormat = format(inicio, "MMMM", { locale: es });
    const finFormat = format(fin, "MMMM yyyy", { locale: es });
    return `${capitalize(inicioFormat)} - ${capitalize(finFormat)}`;
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const parseLocalDate = (input: string): Date => {
    const [year, month, day] = input.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleGuardar = async () => {
    if (!plantelId || !inicioPeriodo || !finPeriodo) {
      return alert("Complete todos los campos.");
    }

    const inicio = parseLocalDate(inicioPeriodo);
    const fin = parseLocalDate(finPeriodo);

    if (inicio > fin) {
      return alert("La fecha de inicio no puede ser mayor a la de fin.");
    }

    const tipoPeriodo = deducirTipoPeriodo(inicio, fin);
    const concatenado = generarConcatenado(inicio, fin);

    setLoading(true);

    const { error } = await supabase.from("periodo_pago").insert([
      {
        inicio_periodo: inicio.toISOString(),
        fin_periodo: fin.toISOString(),
        tipo_periodo: tipoPeriodo,
        concatenado: concatenado,
        plantel_id: plantelId,
      },
    ]);

    setTimeout(() => setLoading(false), 1000);

    if (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el periodo: " + error.message);
    } else {
      setSuccessMessage("¡Periodo guardado con éxito!");
      setTimeout(() => router.push("/periodos"), 2000);
    }
  };

  const handleCancelar = () => {
    router.push("/periodos");
  };

  return (
    <div className="relative p-8 bg-white-100 max-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <Atom color="#2464ec" size="large" />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded shadow">
          {successMessage}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-6">
        <span className="font-bold text-black">Periodos</span> | Registro de
        periodo de pago
      </h2>

      <div className="border rounded shadow bg-white">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-t">
          Datos del periodo de pago
        </div>

        <div className="p-4">
          <label className="block mb-2 font-medium">Plantel:</label>
          <select
            value={plantelId}
            onChange={(e) => setPlantelId(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          >
            <option value="">Seleccione un plantel</option>
            {planteles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_plantel}
              </option>
            ))}
          </select>

          <label className="block mb-2 font-medium">Fecha de inicio:</label>
          <input
            type="date"
            value={inicioPeriodo}
            onChange={(e) => setInicioPeriodo(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />

          <label className="block mb-2 font-medium">Fecha de fin:</label>
          <input
            type="date"
            value={finPeriodo}
            onChange={(e) => setFinPeriodo(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            disabled={loading}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelar}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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

export default RegistroPeriodoPago;
