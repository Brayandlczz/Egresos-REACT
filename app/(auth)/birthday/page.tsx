"use client"

import React, { useEffect, useState } from "react"
import { SolicitudFormBase } from "./form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SolicitudCumpleanosForm() {
  const [perfil, setPerfil] = useState<null | {
    nombre: string
    departamento: string
    puesto: string
  }>(null)

  const [loading, setLoading] = useState(true)
  const router = useRouter();
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

      if (authError || !user) {
        setError("No se pudo obtener el usuario. Intente nuevamente.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("nombre, departamento, puesto")
        .eq("id", user.id)
        .single()

      if (error) {
        setError("No se pudo cargar el perfil del usuario.")
      } else if (!data) {
        setError("No se encontró el perfil del usuario.")
      } else {
        setPerfil(data)
      }

      setLoading(false)
    }

    fetchPerfil()
  }, [])

  const handleSubmit = async (formData: any) => {
    if (!perfil) {
      return {
        success: false,
        message: "No se pudo obtener el perfil del usuario",
      }
    }

    try {
      const solicitud = {
        fecha_cumpleanos: formData.fecha_cumpleanos,
        fecha_dia_libre: formData.fecha_dia_libre,
        motivo: formData.motivo,
        nombre: perfil.nombre,
        departamento: perfil.departamento,
        puesto: perfil.puesto,
      }

      console.log("Solicitud enviada:", solicitud)

      return {
        success: true,
        message: "Solicitud enviada correctamente",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Ocurrió un error al enviar la solicitud",
      }
    }
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Cargando datos del perfil...</p>
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>
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

      <SolicitudFormBase title="Solicitud de permiso por día de cumpleaños" onSubmit={handleSubmit}>
          <h2 className="text-center">Complete el formulario para solicitar su día por cumpleaños.</h2>
          <div className="bg-gray-100 p-4 rounded-md border space-y-4 mb-6 cursor-not-allowed">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha_cumpleanos">Fecha de cumpleaños</Label>
            <Input id="fecha_cumpleanos" name="fecha_cumpleanos" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_dia_libre">Fecha para tomar el día libre</Label>
            <Input id="fecha_dia_libre" name="fecha_dia_libre" type="date" required />
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label htmlFor="motivo">Comentarios adicionales (opcional)</Label>
          <Textarea
            id="motivo"
            name="motivo"
            placeholder="Comentarios adicionales sobre tu solicitud..."
          />
        </div>
      </SolicitudFormBase>
    </div>
  )
}
