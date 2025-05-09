// app/components/documentos/documento-form.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Upload, AlertTriangle, ArrowLeft, Users } from 'lucide-react'
import { DocumentosService, type DocumentoFormData, type Documento } from "@/app/services/documentos-service"

type DocumentoFormProps = {
  documento?: Documento
  isEditing?: boolean
}

type Empleado = {
  id: string
  nombre?: string
  apellido?: string
  email?: string
}

export function DocumentoForm({ documento, isEditing = false }: DocumentoFormProps) {
  const [formData, setFormData] = useState<DocumentoFormData>({
    titulo: documento?.titulo || "",
    descripcion: documento?.descripcion || "",
    tipo: documento?.tipo || "general",
    empleados_ids: documento?.empleados?.map(e => e.id) || [],
    archivo: null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [archivoActual, setArchivoActual] = useState<string | null>(documento?.archivo_url || null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loadingEmpleados, setLoadingEmpleados] = useState(false)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Cargar la lista de empleados para documentos personales
  useEffect(() => {
    async function cargarEmpleados() {
      setLoadingEmpleados(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nombre, apellido, email")
          .order("nombre")
        
        if (error) throw error
        
        setEmpleados(data || [])
      } catch (err) {
        console.error("Error al cargar empleados:", err)
      } finally {
        setLoadingEmpleados(false)
      }
    }
    
    cargarEmpleados()
  }, [supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, archivo: e.target.files![0] }))
    }
  }

  const handleEmpleadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value)
    setFormData(prev => ({
      ...prev,
      empleados_ids: selectedOptions
    }))
  }

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value as 'general' | 'personal'
    setFormData(prev => ({
      ...prev,
      tipo,
      // Si cambia de personal a general, limpiar los empleados seleccionados
      empleados_ids: tipo === 'general' ? [] : prev.empleados_ids
    }))
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

      if (isEditing && documento) {
        result = await DocumentosService.updateDocumento(documento.id, formData)
      } else {
        result = await DocumentosService.createDocumento(formData, user.id)
      }

      if (result.success) {
        setSuccess(`${result.message} Redirigiendo...`)
        setIsRedirecting(true)

        // Usar setTimeout para dar tiempo a que se muestre el mensaje
        setTimeout(() => {
          router.push("/admin/documentos")
        }, 1500)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      console.error("Error al guardar documento:", err)
      setError(typeof err.message === "string" ? err.message : "Error al guardar el documento")
    } finally {
      setIsSubmitting(false)
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
        <h1 className="text-xl font-semibold">{isEditing ? "Editar documento" : "Crear nuevo documento"}</h1>
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
              Título del documento *
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              value={formData.titulo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingrese el título del documento"
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
              placeholder="Ingrese la descripción detallada del documento"
              disabled={isSubmitting || isRedirecting}
            />
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de documento *
            </label>
            <select
              id="tipo"
              name="tipo"
              required
              value={formData.tipo}
              onChange={handleTipoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || isRedirecting}
            >
              <option value="general">General (visible para todos)</option>
              <option value="personal">Personal (visible para empleados seleccionados)</option>
            </select>
          </div>

          {formData.tipo === 'personal' && (
            <div>
              <label htmlFor="empleados_ids" className="block text-sm font-medium text-gray-700 mb-1">
                Empleados *
              </label>
              <div className="flex items-center mb-2">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-500">Seleccione los empleados que podrán ver este documento</span>
              </div>
              {loadingEmpleados ? (
                <div className="flex items-center text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Cargando empleados...</span>
                </div>
              ) : (
                <select
                  id="empleados_ids"
                  name="empleados_ids"
                  multiple
                  required={formData.tipo === 'personal'}
                  value={formData.empleados_ids}
                  onChange={handleEmpleadoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size={5}
                  disabled={isSubmitting || isRedirecting}
                >
                  {empleados.map(empleado => (
                    <option key={empleado.id} value={empleado.id}>
                      {empleado.nombre} {empleado.apellido} ({empleado.email})
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-xs text-gray-500">Mantenga presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples empleados</p>
            </div>
          )}

          <div>
            <label htmlFor="archivo" className="block text-sm font-medium text-gray-700 mb-1">
              Archivo adjunto *
            </label>
            <div className="mt-1 flex items-center">
              <input
                id="archivo"
                name="archivo"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="sr-only"
                disabled={isSubmitting}
               // required={!isEditing && !documento?.archivo_url}
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
                    {documento?.nombre_archivo || "Ver archivo actual"}
                  </a>
                </div>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">Formatos aceptados: PDF, Word, Excel, imágenes (hasta 5MB)</p>
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
                "Actualizar documento"
              ) : (
                "Crear documento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}