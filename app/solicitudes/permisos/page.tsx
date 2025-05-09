import { SolicitudPermisosForm } from "@/app/components/solicitudes/solicitud-permisos-form"

export default function PermisosPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Solicitud de Permisos</h1>
      <SolicitudPermisosForm />
    </div>
  )
}

