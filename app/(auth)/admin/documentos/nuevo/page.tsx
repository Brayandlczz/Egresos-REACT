// app/(auth)/admin/documentos/nuevo/page.tsx
import { DocumentoForm } from "@/app/components/documentos/documento-form"

export default function NuevoDocumentoPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Documento</h1>
      <DocumentoForm isEditing={false} />
    </div>
  )
}