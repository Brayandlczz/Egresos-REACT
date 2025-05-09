"use client"

import type React from "react"

import { useState } from "react"
import { SolicitudFormBase } from "./solicitud-form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/app/context/auth-context"
import { useJefeDirecto } from "@/app/hooks/use-jefe-directo"
import { SolicitudesService } from "@/app/services/solicitudes-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { differenceInCalendarDays, parseISO } from "date-fns"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function SolicitudIncapacidadesForm() {
  const { user } = useAuth()
  const { jefeDirecto, isLoading, error } = useJefeDirecto()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [diasCalculados, setDiasCalculados] = useState<number | null>(null)
  const [archivoUrl, setArchivoUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClientComponentClient()

  // Calcular días entre fechas
  const calcularDias = () => {
    if (fechaInicio && fechaFin) {
      const inicio = parseISO(fechaInicio)
      const fin = parseISO(fechaFin)
      const dias = differenceInCalendarDays(fin, inicio) + 1 // +1 para incluir el día final
      setDiasCalculados(dias > 0 ? dias : 0)
    } else {
      setDiasCalculados(null)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `incapacidades/${fileName}`

      const { error: uploadError, data } = await supabase.storage.from("documentos").upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("documentos").getPublicUrl(filePath)

      setArchivoUrl(publicUrl)
    } catch (error) {
      console.error("Error al subir archivo:", error)
      alert("Error al subir el archivo. Intenta de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    if (!user?.id || !jefeDirecto) {
      return { success: false, message: "No se pudo identificar al usuario o al jefe directo" }
    }

    try {
      const data = {
        empleado_id: user.id,
        jefe_directo_id: jefeDirecto,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        dias_incapacidad: Number.parseInt(formData.dias_incapacidad),
        diagnostico: formData.diagnostico,
        folio_incapacidad: formData.folio_incapacidad,
        archivo_url: archivoUrl,
      }

      const result = await SolicitudesService.crearSolicitudIncapacidades(data)
      return result
    } catch (error: any) {
      console.error("Error al crear solicitud de incapacidad:", error)
      return {
        success: false,
        message: error.message || "Error al crear la solicitud de incapacidad",
      }
    }
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (error || !jefeDirecto) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error || "No se ha asignado un jefe directo. Por favor, contacta a Recursos Humanos."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <SolicitudFormBase
      title="Solicitud de Incapacidad"
      description="Completa el formulario para registrar una incapacidad médica"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
          <Input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            required
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value)
              if (fechaFin) calcularDias()
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_fin">Fecha de fin</Label>
          <Input
            id="fecha_fin"
            name="fecha_fin"
            type="date"
            required
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value)
              if (fechaInicio) calcularDias()
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dias_incapacidad">Días de incapacidad</Label>
        <Input
          id="dias_incapacidad"
          name="dias_incapacidad"
          type="number"
          required
          min="1"
          value={diasCalculados !== null ? diasCalculados : ""}
          readOnly
        />
        {diasCalculados !== null && diasCalculados <= 0 && (
          <p className="text-sm text-red-500">El período seleccionado debe incluir al menos un día</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="folio_incapacidad">Folio de incapacidad</Label>
        <Input id="folio_incapacidad" name="folio_incapacidad" placeholder="Número de folio de la incapacidad" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnostico">Diagnóstico</Label>
        <Textarea id="diagnostico" name="diagnostico" placeholder="Diagnóstico médico" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="archivo">Documento de incapacidad</Label>
        <Input
          id="archivo"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        {isUploading && <p className="text-sm text-gray-500">Subiendo archivo...</p>}
        {archivoUrl && <p className="text-sm text-green-500">Archivo subido correctamente</p>}
      </div>
    </SolicitudFormBase>
  )
}

