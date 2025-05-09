// app/components/avisos/aviso-form.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Upload, AlertTriangle, ArrowLeft } from "lucide-react"
import { AvisosService, type AvisoFormData, type Aviso } from "@/app/services/avisos-service"

type AvisoFormProps = {
  aviso?: Aviso
  isEditing?: boolean
}

export function AvisoForm({ aviso, isEditing = false }: AvisoFormProps) {
  const [formData, setFormData] = useState<AvisoFormData>({
    titulo: aviso?.titulo || "",
    descripcion: aviso?.descripcion || "",
    fecha_publicacion: aviso?.fecha_publicacion || new Date().toLocaleDateString("en-CA"),
    archivo: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [archivoActual, setArchivoActual] = useState<string | null>(aviso?.archivo_url || null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, archivo: e.target.files![0] }))
    }
  }

  // Función para manejar la redirección
  const handleRedirect = () => {
    // Usar window.location para forzar una redirección completa
    window.location.href = "/admin/avisos"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No se pudo identificar al usuario")
      }

      let result

      if (isEditing && aviso) {
        result = await AvisosService.updateAviso(aviso.id, formData)
      } else {
        result = await AvisosService.createAviso(formData, user.id)
      }

      if (result.success) {
        setSuccess(`${result.message} Redirigiendo...`)

        // Usar setTimeout para dar tiempo a que se muestre el mensaje
        setTimeout(() => {
          // Usar router.push con opciones de revalidación
          router.push("/admin/avisos")
          
        }, 1500)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      console.error("Error al guardar aviso:", err)
      setError(typeof err.message === "string" ? err.message : "Error al guardar el aviso")
    } finally {
      // No desactivamos isSubmitting para mantener los botones deshabilitados durante la redirección
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Barra de navegación */}
      <div className="mb-6 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Volver"
          disabled={isSubmitting || isRedirecting}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">{isEditing ? "Editar aviso" : "Crear nuevo aviso"}</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
            {isRedirecting && (
              <div className="mt-2 flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Redirigiendo...</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
              Título del aviso *
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el título del aviso"
              disabled={isSubmitting || isRedirecting}
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={5}
              required
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese la descripción detallada del aviso"
              disabled={isSubmitting || isRedirecting}
            />
          </div>

          <div>
            <label htmlFor="fecha_publicacion" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de publicación *
            </label>
            <input
              id="fecha_publicacion"
              name="fecha_publicacion"
              type="date"
              required
              value={formData.fecha_publicacion}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || isRedirecting}
            />
          </div>

          <div>
            <label htmlFor="archivo" className="block text-sm font-medium text-gray-700 mb-1">
              Archivo adjunto (PDF)
            </label>
            <div className="mt-1 flex items-center">
              <input
                id="archivo"
                name="archivo"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="sr-only"
                disabled={isSubmitting}
              />
              <label
                htmlFor="archivo"
                className={`relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  {formData.archivo ? formData.archivo.name : "Seleccionar archivo"}
                </span>
              </label>

              {!formData.archivo && archivoActual && (
                <div className="ml-3 text-sm text-gray-500">
                  <a
                    href={archivoActual}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {aviso?.nombre_archivo || "Ver archivo actual"}
                  </a>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">PDF de hasta 5MB (opcional)</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting || isRedirecting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isRedirecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? "Actualizando..." : "Creando..."}
                </span>
              ) : isEditing ? (
                "Actualizar aviso"
              ) : (
                "Crear aviso"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

