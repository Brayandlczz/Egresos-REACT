"use client"

import { useState } from "react"
import { SolicitudFormBase } from "./solicitud-form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/app/context/auth-context"
import { useJefeDirecto } from "@/app/hooks/use-jefe-directo"
import { SolicitudesService } from "@/app/services/solicitudes-service"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { differenceInBusinessDays, parseISO } from "date-fns"

export function SolicitudVacacionesForm() {
  const { user } = useAuth()
  const { jefeDirecto, isLoading, error } = useJefeDirecto()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [diasCalculados, setDiasCalculados] = useState<number | null>(null)

  // Calcular días hábiles entre fechas
  const calcularDiasHabiles = () => {
    if (fechaInicio && fechaFin) {
      const inicio = parseISO(fechaInicio)
      const fin = parseISO(fechaFin)
      const dias = differenceInBusinessDays(fin, inicio) + 1 // +1 para incluir el día final
      setDiasCalculados(dias > 0 ? dias : 0)
    } else {
      setDiasCalculados(null)
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
        dias_solicitados: Number.parseInt(formData.dias_solicitados),
        motivo: formData.motivo,
      }

      const result = await SolicitudesService.crearSolicitudVacaciones(data)
      return result
    } catch (error: any) {
      console.error("Error al crear solicitud de vacaciones:", error)
      return {
        success: false,
        message: error.message || "Error al crear la solicitud de vacaciones",
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
      title="Solicitud de Vacaciones"
      description="Completa el formulario para solicitar tus días de vacaciones"
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
              if (fechaFin) calcularDiasHabiles()
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
              if (fechaInicio) calcularDiasHabiles()
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dias_solicitados">Días solicitados (hábiles)</Label>
        <Input
          id="dias_solicitados"
          name="dias_solicitados"
          type="number"
          required
          min="1"
          value={diasCalculados !== null ? diasCalculados : ""}
          readOnly
        />
        {diasCalculados !== null && diasCalculados <= 0 && (
          <p className="text-sm text-red-500">El período seleccionado debe incluir al menos un día hábil</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo (opcional)</Label>
        <Textarea id="motivo" name="motivo" placeholder="Describe brevemente el motivo de tu solicitud" />
      </div>
    </SolicitudFormBase>
  )
}

