// app/components/avisos/avisos-table.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Trash2, FileText, AlertTriangle, ExternalLink } from "lucide-react"
import { type Aviso, AvisosService } from "@/app/services/avisos-service"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type AvisosTableProps = {
  avisos: Aviso[]
}

export function AvisosTable({ avisos }: AvisosTableProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avisosList, setAvisosList] = useState<Aviso[]>(avisos)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este aviso? Esta acción no se puede deshacer.")) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await AvisosService.deleteAviso(id)

      if (result.success) {
        // Actualizar la lista localmente
        setAvisosList(avisosList.filter((aviso) => aviso.id !== id))
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      console.error("Error al eliminar aviso:", err)
      setError(err.message || "Error al eliminar el aviso")
    } finally {
      setLoading(false)
    }
  }

  if (avisosList.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No hay avisos disponibles.</p>
        <Link
          href="/admin/avisos/nuevo"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Crear primer aviso
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de publicación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Creado por
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {avisosList.map((aviso) => (
            <tr key={aviso.id} className="hover:bg-gray-50 transition-colors duration-150">
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{aviso.titulo}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {aviso.descripcion.length > 100 ? `${aviso.descripcion.substring(0, 100)}...` : aviso.descripcion}
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {format(new Date(aviso.fecha_publicacion), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </div>
              </td>
              // app/components/avisos/avisos-table.tsx // Corregir la parte donde renderizamos el creador
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {aviso.creador?.nombre
                    ? `${aviso.creador.nombre} ${aviso.creador.apellido || ""}`
                    : aviso.creador?.email || "Usuario desconocido"}
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                {aviso.archivo_url ? (
                  <a
                    href={aviso.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    <span className="text-sm">Ver PDF</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">Sin archivo</span>
                )}
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Link href={`/admin/avisos/editar/${aviso.id}`} className="text-indigo-600 hover:text-indigo-900">
                    <Edit className="h-5 w-5" />
                    <span className="sr-only">Editar</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(aviso.id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Eliminar</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

