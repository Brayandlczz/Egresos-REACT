"use client"

import type React from "react"
import { SolicitudFormBase } from "./form-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SolicitudIncapacidadesForm() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SolicitudFormBase
        title="Solicitud de Incapacidad"
        description="Completa el formulario para registrar una incapacidad médica."
        onSubmit={async () => {
          return {
            success: true,
            message: "Solicitud enviada (modo estático)",
          }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
            <Input id="fecha_inicio" name="fecha_inicio" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_fin">Fecha de fin</Label>
            <Input id="fecha_fin" name="fecha_fin" type="date" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dias_incapacidad">Días de incapacidad</Label>
          <Input id="dias_incapacidad" name="dias_incapacidad" type="number" required min="1" readOnly value="5" />
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
          <Label htmlFor="archivo">Comprobante médico</Label>
          <Input id="archivo" type="file" accept=".pdf,.jpg,.jpeg,.png" disabled />
          <p className="text-sm text-gray-500">Este formulario no sube archivos en modo estático.</p>
        </div>
      </SolicitudFormBase>
    </div>
  )
}
