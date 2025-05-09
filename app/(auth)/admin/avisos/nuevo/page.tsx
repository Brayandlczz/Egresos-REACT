import { AvisoForm } from "@/app/components/avisos/aviso-form"

export default function NuevoAvisoPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Aviso</h1>
      <AvisoForm isEditing={false} />
    </div>
  )
}

