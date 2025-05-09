"use client"

import { SolicitudFormBase } from "./solicitud-form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/app/context/auth-context"
import { useJefeDirecto } from "@/app/hooks/use-jefe-directo"
import { SolicitudesService } from "@/app/services/solicitudes-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SolicitudPermisosForm() {
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
        fecha_permiso: formData.fecha_permiso,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
        motivo: formData.motivo,
      }

      const result = await SolicitudesService.crearSolicitudPermisos(data)
      return result
    } catch (error: any) {
      console.error("Error al crear solicitud de permiso:", error)
      return {
        success: false,
        message: error.message || "Error al crear la solicitud de permiso",
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
      title="Solicitud de Permiso"
      description="Completa el formulario para solicitar un permiso durante la jornada laboral"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="fecha_permiso">Fecha del permiso</Label>
        <Input id="fecha_permiso" name="fecha_permiso" type="date" required />
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
        <Textarea id="motivo" name="motivo" placeholder="Describe el motivo de tu solicitud de permiso" required />
      </div>
    </SolicitudFormBase>
  )
}

