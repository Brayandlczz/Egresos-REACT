"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2 } from "lucide-react"

export type EmpleadoData = {
  id: string
  nombre?: string
  email?: string
  puesto?: string
  departamento?: string
  telefono?: string
  foto_url?: string
}

export default function DirectorioPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [empleados, setEmpleados] = useState<EmpleadoData[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function cargarEmpleados() {
      try {
        console.log("Cargando empleados...")
        const { data, error } = await supabase
          .from("profiles")
          .select("id, nombre, email, puesto, departamento, telefono, foto_url")

        if (error) throw error

        console.log("Empleados cargados:", data?.length || 0)
        setEmpleados(data || [])
      } catch (err: any) {
        console.error("Error al cargar empleados:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarEmpleados()
  }, [supabase])

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Cargando directorio de empleados...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Directorio de Personal</h1>

      {/* Contenido principal */}
      {error ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">Error al cargar el directorio: {error}</div>
      ) : empleados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {empleados.map((empleado) => (
            <div
              key={empleado.id}
              className="bg-white p-4 rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              {/* Imagen de perfil redonda */}
              <div className="flex justify-center mb-3">
                {empleado.foto_url ? (
                  <img
                    src={empleado.foto_url || "/placeholder.svg"}
                    alt={`${empleado.nombre || ""}`}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200 shadow">
                    <span className="text-blue-600 text-xl font-bold">
                      {`${empleado.nombre?.[0] || ""}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center mb-3">
                <h3 className="font-bold text-lg">
                  {empleado.nombre}
                </h3>
                <p className="text-blue-600 text-sm">{empleado.puesto}</p>
                <p className="text-gray-500 text-sm">{empleado.departamento}</p>
              </div>
              <hr className="my-2" />
              <div className="space-y-2">
                {empleado.email && (
                  <div className="flex items-center text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">Correo: </span>
                    <span className="ml-1">{empleado.email}</span>
                  </div>
                )}
                {empleado.telefono && (
                  <div className="flex items-center text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="font-medium">Teléfono: </span>
                    <span className="ml-1">{empleado.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No se encontraron empleados en el directorio.
        </div>
      )}
    </div>
  )
}

