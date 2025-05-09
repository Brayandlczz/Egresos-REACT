"use client"

import { SolicitudFormBase } from "./solicitud-form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/app/context/auth-context"
import { useJefeDirecto } from "@/app/hooks/use-jefe-directo"
import { SolicitudesService } from "@/app/services/solicitudes-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SolicitudCumpleanosForm() {
  const { user } = useAuth()
  const { jefeDirecto, isLoading, error } = useJefeDirecto()

  const handleSubmit = async (formData: any) => {
    if (!user?.id || !jefeDirecto) {
      return { success: false, message: "No se pudo identificar al usuario o al jefe directo" }
    }

    try {
      const data = {
        empleado_id: user.id,
        jefe_directo_id: jefeDirecto,
        fecha_cumpleanos: formData.fecha_cumpleanos,
        fecha_dia_libre: formData.fecha_dia_libre,
        motivo: formData.motivo,
      }

      const result = await SolicitudesService.crearSolicitudCumpleanos(data)
      return result
    } catch (error: any) {
      console.error("Error al crear solicitud de día de cumpleaños:", error)
      return {
        success: false,
        message: error.message || "Error al crear la solicitud de día de cumpleaños",
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
      title="Solicitud de Día de Cumpleaños"
      description="Completa el formulario para solicitar tu día libre por cumpleaños"
      onSubmit={handleSubmit}
    >
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

      <div className="space-y-2">
        <Label htmlFor="motivo">Comentarios adicionales (opcional)</Label>
        <Textarea id="motivo" name="motivo" placeholder="Comentarios adicionales sobre tu solicitud" />
      </div>
    </SolicitudFormBase>
  )
}

