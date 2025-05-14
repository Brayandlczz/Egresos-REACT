"use client"

import React, { useEffect, useState } from "react"
import { SolicitudFormBase } from "./form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SolicitudPermisosForm() {
  const [perfil, setPerfil] = useState<null | {
    nombre: string
    departamento: string
    puesto: string
  }>(null)

  const [loading, setLoading] = useState(true)
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

      if (error) {
        console.error("Error al obtener perfil:", error)
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
      return { success: false, message: "No se pudo obtener el perfil del usuario" }
    }

    try {
      const data = {
        empleado_id: perfil.uuid,  
        fecha_permiso: formData.fecha_permiso,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        motivo: formData.motivo,
      }

      console.log("Datos enviados:", data)
      return { success: true, message: "Solicitud enviada correctamente (modo prueba)" }
    } catch (error: any) {
      console.error("Error al crear solicitud de permiso:", error)
      return {
        success: false,
        message: error.message || "Error al crear la solicitud de permiso",
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
    <div className="flex items-center justify-center min-h-screen">
      <SolicitudFormBase
        title="Solicitud de permiso"
        description="Complete el formulario para registrar un permiso."
        onSubmit={async () => {
          return {
            success: true,
            message: "Solicitud enviada",
          }
        }}
      >
          {/* Sección de datos del solicitante */}
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
            <Label htmlFor="fecha_permiso">Fecha del permiso</Label>
            <Input id="fecha_permiso" name="fecha_permiso" type="date" defaultValue="2025-05-10" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hora_inicio">Hora de inicio</Label>
              <Input id="hora_inicio" name="hora_inicio" type="time" defaultValue="09:00" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_fin">Hora de fin</Label>
              <Input id="hora_fin" name="hora_fin" type="time" defaultValue="12:00" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del permiso</Label>
            <Textarea
              id="motivo"
              name="motivo"
              placeholder="Describe el motivo de tu solicitud de permiso"
              defaultValue="Asunto personal"
              required
            />
          </div>
        </SolicitudFormBase>
      </div>
  )
}
