import { SolicitudCumpleanosForm } from "@/app/components/solicitudes/solicitud-cumpleanos-form"

export default function CumpleanosPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Solicitud de Día de Cumpleaños</h1>
      <SolicitudCumpleanosForm />
    </div>
  )
}

