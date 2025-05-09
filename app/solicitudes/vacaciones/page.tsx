import { SolicitudVacacionesForm } from "@/app/components/solicitudes/solicitud-vacaciones-form"

export default function VacacionesPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Solicitud de Vacaciones</h1>
      <SolicitudVacacionesForm />
    </div>
  )
}

