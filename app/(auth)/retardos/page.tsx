"use client"

import { SolicitudFormBase } from "./form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SolicitudIncapacidadesForm() {
  const [perfil, setPerfil] = useState<null | {
    nombre: string
    departamento: string
    puesto: string
  }>(null)

  const [loading, setLoading] = useState(true)
  const router = useRouter();
  const [title, description] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fechaActual = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const supabase = createClientComponentClient()
    const fetchPerfil = async () => {
      setLoading(true)
      setError(null)

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      console.log("Usuario autenticado:", user)

      if (authError || !user) {
        console.error("Error al obtener usuario:", authError)
        setError("No se pudo obtener el usuario. Intente nuevamente.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("nombre, departamento, puesto")
        .eq("id", user.id)
        .single()

      console.log("Datos obtenidos de la consulta:", data)
      console.log("Error de la consulta:", error)

      if (error) {
        console.error("Error al obtener perfil:", error.message || error.details)
        setError("No se pudo cargar el perfil del usuario.")
      } else if (!data) {
        console.error("No se encontró el perfil para el usuario:", user.id)
        setError("No se encontró el perfil del usuario.")
      } else {
        setPerfil(data)
      }

      setLoading(false)
    }

    fetchPerfil()
  }, [])

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Cargando datos del perfil...</p>
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>
  }

  const handleSubmit = async (formData: any) => {
    const user = { id: "123" } // Usa el ID del usuario que obtuviste de Supabase o de tu sistema
    const jefeDirecto = "456" // Usualmente sería un valor relacionado al jefe directo del empleado

    if (!user?.id || !jefeDirecto) {
      return { success: false, message: "No se pudo identificar al usuario o al jefe directo" }
    }

    try {
      const data = {
        empleado_id: user.id,
        jefe_directo_id: jefeDirecto,
        fecha_retardo: formData.fecha_retardo,
        hora_llegada: formData.hora_llegada,
        hora_establecida: formData.hora_establecida,
        motivo: formData.motivo,
      }

      console.log("Datos enviados:", data)
      return { success: true, message: "Solicitud de retardo enviada correctamente" }
    } catch (error: any) {
      console.error("Error al crear solicitud de retardo:", error)
      return {
        success: false,
        message: error.message || "Error al crear la solicitud de retardo",
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Volver</h1>
      </div>

      <SolicitudFormBase title="Solicitud de permiso por retardo" onSubmit={handleSubmit}>
          <div className="bg-gray-100 p-4 rounded-md border space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Datos del solicitante</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fecha_solicitud">Fecha de solicitud</Label>
                <Input id="fecha_solicitud" name="fecha_solicitud" type="date" readOnly value={fechaActual} />
              </div>

              <div className="space-y-1">
                <Label>Nombre completo</Label>
                <Input readOnly value={perfil?.nombre || ""} />
              </div>

              <div className="space-y-1">
                <Label>Departamento</Label>
                <Input readOnly value={perfil?.departamento || ""} />
              </div>

              <div className="space-y-1">
                <Label>Puesto</Label>
                <Input readOnly value={perfil?.puesto || ""} />
              </div>
            </div>
          </div>

          {/* Resto del formulario */}
          <div className="space-y-2">
            <Label htmlFor="fecha_retardo">Fecha del retardo</Label>
            <Input id="fecha_retardo" name="fecha_retardo" type="date" defaultValue="2025-05-10" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora_establecida">Hora establecida de entrada</Label>
              <Input id="hora_establecida" name="hora_establecida" type="time" defaultValue="08:00" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_llegada">Hora de llegada</Label>
              <Input id="hora_llegada" name="hora_llegada" type="time" defaultValue="08:25" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del retardo</Label>
            <Textarea
              id="motivo"
              name="motivo"
              placeholder="Describe el motivo de tu retardo"
              defaultValue="Tráfico intenso en el trayecto"
            />
          </div>
        </SolicitudFormBase>
      </div>
  )
}
