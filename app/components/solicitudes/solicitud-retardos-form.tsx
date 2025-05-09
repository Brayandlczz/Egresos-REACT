"use client"

import { SolicitudFormBase } from "./solicitud-form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/app/context/auth-context"
import { useJefeDirecto } from "@/app/hooks/use-jefe-directo"
import { SolicitudesService } from "@/app/services/solicitudes-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SolicitudRetardosForm() {
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
        fecha_retardo: formData.fecha_retardo,
        hora_llegada: formData.hora_llegada,
        hora_establecida: formData.hora_establecida,
        motivo: formData.motivo,
      }

      const result = await SolicitudesService.crearSolicitudRetardos(data)
      return result
    } catch (error: any) {
      console.error("Error al crear solicitud de retardo:", error)
      return {
        success: false,
        message: error.message || "Error al crear la solicitud de retardo",
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
      title="Justificación de Retardo"
      description="Completa el formulario para justificar un retardo en tu horario laboral"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="fecha_retardo">Fecha del retardo</Label>
        <Input id="fecha_retardo" name="fecha_retardo" type="date" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hora_establecida">Hora establecida de entrada</Label>
          <Input id="hora_establecida" name="hora_establecida" type="time" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hora_llegada">Hora de llegada</Label>
          <Input id="hora_llegada" name="hora_llegada" type="time" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo del retardo</Label>
        <Textarea id="motivo" name="motivo" placeholder="Describe el motivo de tu retardo" />
      </div>
    </SolicitudFormBase>
  )
}

