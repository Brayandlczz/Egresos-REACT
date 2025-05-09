import { SolicitudIncapacidadesForm } from "@/app/components/solicitudes/solicitud-incapacidades-form"

export default function IncapacidadesPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Solicitud de Incapacidades</h1>
      <SolicitudIncapacidadesForm />
    </div>
  )
}

