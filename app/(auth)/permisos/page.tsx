"use client"

import React, { useEffect, useState } from "react"
import { SolicitudFormBase } from "./form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Mosaic } from "react-loading-indicators"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SolicitudPermisosForm() {
  const [perfil, setPerfil] = useState<null | {
    id: string
    nombre: string
    departamento: string
    puesto: string
  }>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
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
        .select("id, nombre, departamento, puesto")
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
    const supabase = createClientComponentClient()

    if (!perfil) {
      return { success: false, message: "No se pudo obtener el perfil del usuario" }
    }

    setIsSubmitting(true)

    try {
      const { fecha_permiso, hora_inicio, hora_fin, motivo } = formData

      const payload = {
        empleado_id: perfil.id,
        fecha_solicitud: fechaActual,
        fecha_permiso,
        hora_inicio,
        hora_fin,
        motivo,
        estado: "pendiente"
      }

      console.log("Datos a insertar:", payload)

      const { error } = await supabase.from("solicitud_permiso").insert([payload])

      if (error) {
        console.error("Error al insertar en solicitud_permiso:", error?.message || error)
        setIsSubmitting(false)
        return { success: false, message: "Error al guardar la solicitud." }
      }

      setTimeout(() => {
        router.push("/solicitudes")
      }, 1500) 

      return { success: true, message: "Solicitud guardada correctamente." }
    } catch (error: any) {
      console.error("Error inesperado:", error)
      setIsSubmitting(false)
      return {
        success: false,
        message: error.message || "Error inesperado al crear la solicitud",
      }
    }
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Mosaic color="#2464ec" size="medium" />
        <p className="mt-4 text-gray-600 text-center">Redirigiendo, por favor espere...</p>
      </div>  
    )
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

      <SolicitudFormBase title="Nueva Solicitud de permiso" onSubmit={handleSubmit}>
        <h2 className="text-center">Complete el formulario para solicitar un permiso de ausencia.</h2>

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

        <div className="space-y-2">
          <Label htmlFor="fecha_permiso">Fecha del permiso</Label>
          <Input id="fecha_permiso" name="fecha_permiso" type="date" defaultValue={fechaActual} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hora_inicio">Hora de inicio</Label>
            <Input id="hora_inicio" name="hora_inicio" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hora_fin">Hora de fin</Label>
            <Input id="hora_fin" name="hora_fin" type="time" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivo">Motivo del permiso</Label>
          <Textarea
            id="motivo"
            name="motivo"
            placeholder="Explique detalladamente el motivo de su solicitud..."
            required
          />
        </div>
      </SolicitudFormBase>
    </div>
  )
}
