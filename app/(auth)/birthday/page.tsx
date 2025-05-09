"use client"

import { SolicitudFormBase } from "./form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SolicitudCumpleanosForm() {
  const handleSubmit = async (formData: any) => {
    return {
      success: true,
      message: "Solicitud enviada (modo estático)",
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6">
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

          <div className="space-y-2 mt-4">
            <Label htmlFor="motivo">Comentarios adicionales (opcional)</Label>
            <Textarea id="motivo" name="motivo" placeholder="Comentarios adicionales sobre tu solicitud..." />
          </div>
        </SolicitudFormBase>
      </div>
    </div>
  )
}
