// app/(auth)/admin/documentos/editar/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from 'lucide-react'
import { DocumentoForm } from "@/app/components/documentos/documento-form"
import type { Documento } from "@/app/services/documentos-service"

type EmpleadoData = {
  empleado: {
    id: string
    nombre: string
    email: string
  }
}

export default function EditarDocumentoPage() {
  const params = useParams()
  const router = useRouter()
  const [documento, setDocumento] = useState<Documento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const id = params.id as string

  useEffect(() => {
    async function cargarDocumento() {
      if (!id) return

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("documentos")
          .select(`
            *,
            creador:profiles(nombre, email)
          `)
          .eq("id", id)
          .single()

        if (error) throw error
        if (!data) throw new Error("No se encontró el documento")

        // Si es personal, obtener empleados
        if (data.tipo === 'personal') {
          const { data: empleadosData, error: empleadosError } = await supabase
            .from("documentos_empleados")
            .select(`
              empleado:profiles(id, nombre, email)
            `)
            .eq("documento_id", id)

        if (!empleadosError && empleadosData) {
          data.empleados = (empleadosData as any[]).map(e => ({
            id: e.empleado.id,
            nombre: e.empleado.nombre,
            email: e.empleado.email
          }))
        }
        }

        setDocumento(data)
      } catch (err: any) {
        console.error("Error al cargar el documento:", err)
        setError(err.message || "Error al cargar el documento")
      } finally {
        setLoading(false)
      }
    }

    cargarDocumento()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Cargando información del documento...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Editar Documento</h1>
      {documento ? (
        <DocumentoForm documento={documento} isEditing={true} />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No se encontró el documento solicitado.
        </div>
      )}
    </div>
  )
}
