import { SolicitudRetardosForm } from "@/app/components/solicitudes/solicitud-retardos-form"

export default function RetardosPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Justificación de Retardos</h1>
      <SolicitudRetardosForm />
    </div>
  )
}

