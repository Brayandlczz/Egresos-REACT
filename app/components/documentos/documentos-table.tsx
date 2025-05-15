// app/components/documentos/documentos-table.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Edit,
  Trash2,
  FileText,
  AlertTriangle,
  ExternalLink,
  Users,
  Globe,
  Search,
  Filter,
  ChevronDown,
  X,
  ArrowLeft,
  Plus,
} from "lucide-react"
import { type Documento, DocumentosService } from "@/app/services/documentos-service"
import { format } from "date-fns"

type DocumentosTableProps = {
  documentos: Documento[]
  todosEmpleados?: {
    id: string
    nombre?: string
    email?: string
  }[]
}

// Actualizar la función del componente para incluir los filtros y la búsqueda
export function DocumentosTable({ documentos, todosEmpleados = [] }: DocumentosTableProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentosList, setDocumentosList] = useState<Documento[]>(documentos)
  const router = useRouter()

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState<"todos" | "general" | "personal">("todos")
  const [empleadoFilter, setEmpleadoFilter] = useState<string>("todos")
  const [showFilters, setShowFilters] = useState(false)

  // Aplicar filtros cuando cambien
  const filteredDocumentos = useMemo(() => {
    return documentos.filter((doc) => {
      // Filtro por término de búsqueda
      const matchesSearch =
        doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.descripcion.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por tipo
      const matchesTipo = tipoFilter === "todos" || doc.tipo === tipoFilter

      // Filtro por empleado
      const matchesEmpleado =
        empleadoFilter === "todos" ||
        (doc.tipo === "personal" && doc.empleados?.some((emp) => emp.id === empleadoFilter))

      return matchesSearch && matchesTipo && matchesEmpleado
    })
  }, [documentos, searchTerm, tipoFilter, empleadoFilter])

  // Actualizar la lista cuando cambien los filtros
  useEffect(() => {
    setDocumentosList(filteredDocumentos)
  }, [filteredDocumentos])

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm("")
    setTipoFilter("todos")
    setEmpleadoFilter("todos")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.")) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await DocumentosService.deleteDocumento(id)

      if (result.success) {
        // Actualizar la lista localmente
        setDocumentosList(documentosList.filter((documento) => documento.id !== id))
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      console.error("Error al eliminar documento:", err)
      setError(err.message || "Error al eliminar el documento")
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener la extensión del archivo
  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || ""
  }

  // Función para determinar el tipo de archivo
  const getFileType = (filename: string) => {
    const ext = getFileExtension(filename)
    if (["pdf"].includes(ext)) return "PDF"
    if (["doc", "docx"].includes(ext)) return "Word"
    if (["xls", "xlsx"].includes(ext)) return "Excel"
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "Imagen"
    return "Documento"
  }

  if (documentosList.length === 0) {
    // Verificar si hay filtros activos
    const hayFiltrosActivos = searchTerm !== "" || tipoFilter !== "todos" || empleadoFilter !== "todos";
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">
          {hayFiltrosActivos 
            ? "No se encontraron documentos con los filtros seleccionados." 
            : "No hay documentos disponibles."}
        </p>
        
        <div className="mt-4 flex justify-center gap-4">
          {hayFiltrosActivos && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a todos los documentos
            </button>
          )}
          
          <Link
            href="/admin/documentos/nuevo"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear nuevo documento
          </Link>
        </div>
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

      {/* Barra de búsqueda y filtros */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Buscador */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {/* Contador de resultados */}
          <div className="flex items-center text-sm text-gray-500">
            {documentosList.length} {documentosList.length === 1 ? "documento" : "documentos"}
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Filtro por tipo */}
              <div className="flex-1">
                <label htmlFor="tipoFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de documento
                </label>
                <select
                  id="tipoFilter"
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value as "todos" | "general" | "personal")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="general">General</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              {/* Filtro por empleado */}
              <div className="flex-1">
                <label htmlFor="empleadoFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Empleado asignado
                </label>
                <select
                  id="empleadoFilter"
                  value={empleadoFilter}
                  onChange={(e) => setEmpleadoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos los empleados</option>
                  {todosEmpleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón para resetear filtros */}
              <div className="flex items-end">
                <button onClick={resetFilters} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado por
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Archivo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documentosList.map((documento) => (
              <tr key={documento.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{documento.titulo}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {documento.descripcion.length > 100
                      ? `${documento.descripcion.substring(0, 100)}...`
                      : documento.descripcion}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {documento.tipo === "general" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Globe className="h-3 w-3 mr-1" />
                        General
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Users className="h-3 w-3 mr-1" />
                          Personal
                        </span>
                        {documento.empleados && documento.empleados.length > 0 && (
                          <div className="mt-1">
                            <details className="text-xs">
                              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                                {documento.empleados.length}{" "}
                                {documento.empleados.length === 1 ? "empleado" : "empleados"}
                              </summary>
                              <ul className="mt-1 pl-2 text-gray-600 space-y-1">
                                {documento.empleados.map((emp) => (
                                  <li key={emp.id}>
                                    {emp.nombre}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {documento.created_at
                      ? format(new Date(documento.created_at), "dd/MM/yyyy")
                      : "Fecha no disponible"}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {documento.creador?.nombre
                      ? `${documento.creador.nombre}`
                      : documento.creador?.email || "Usuario desconocido"}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  {documento.archivo_url ? (
                    <a
                      href={documento.archivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={documento.nombre_archivo || undefined}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {documento.nombre_archivo || `${getFileType(documento.archivo_url)}`}
                      </span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">Sin archivo</span>
                  )}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/documentos/editar/${documento.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="sr-only">Editar</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(documento.id)}
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

        <div className="md:hidden text-center text-xs text-gray-500 py-2 border-t border-gray-100">
          ← Desliza horizontalmente para ver todas las columnas →
        </div>
      </div>
    </div>
  )
}

