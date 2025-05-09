"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from 'lucide-react'
import { AvisoForm } from "@/app/components/avisos/aviso-form"
import type { Aviso } from "@/app/services/avisos-service"

export default function EditarAvisoPage() {
const params = useParams()
const router = useRouter()
const [aviso, setAviso] = useState<Aviso | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const supabase = createClientComponentClient()

// Obtener el ID del aviso de los parámetros de la URL
const id = params.id as string

// Cargar los datos del aviso cuando se monte el componente
useEffect(() => {
  async function cargarAviso() {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Consultar el aviso por su ID
      const { data, error } = await supabase
        .from("avisos")
        .select(`
          *,
          creador:profiles(nombre, apellido, email)
        `)
        .eq("id", id)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error("No se encontró el aviso")
      }

      setAviso(data)
    } catch (err: any) {
      console.error("Error al cargar el aviso:", err)
      setError(err.message || "Error al cargar el aviso")
    } finally {
      setLoading(false)
    }
  }

  cargarAviso()
}, [id, supabase])

// Mostrar estado de carga
if (loading) {
  return (
    <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600">Cargando información del aviso...</p>
    </div>
  )
}

// Mostrar mensaje de error si ocurrió algún problema
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

// Renderizar el formulario de edición con los datos del aviso
return (
  <div className="container mx-auto py-6">
    <h1 className="text-2xl font-bold mb-6">Editar Aviso</h1>
    {aviso ? (
      <AvisoForm aviso={aviso} isEditing={true} />
    ) : (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        No se encontró el aviso solicitado.
      </div>
    )}
  </div>
)
}

