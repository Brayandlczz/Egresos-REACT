// app/(auth)/documentos/page.tsx
"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Search, FileText, Download, Globe, Users, Filter } from 'lucide-react'
import type { Documento } from "@/app/services/documentos-service"
import { DocumentosService } from "@/app/services/documentos-service"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [filteredDocumentos, setFilteredDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "general" | "personal">("todos")
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Obtener el ID del usuario actual y cargar documentos
  useEffect(() => {
    async function inicializar() {
      try {
        setLoading(true)
        
        // Obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          throw new Error("No se pudo identificar al usuario")
        }
        
        setUserId(user.id)
        
        // Cargar documentos para el usuario
        const docs = await DocumentosService.getDocumentosParaEmpleado(user.id)
        setDocumentos(docs)
        setFilteredDocumentos(docs)
      } catch (err: any) {
        console.error("Error al cargar documentos:", err)
        setError(err.message || "Error al cargar documentos")
      } finally {
        setLoading(false)
      }
    }
    
    inicializar()
  }, [supabase])

  // Filtrar documentos cuando cambia el término de búsqueda o el tipo de filtro
  useEffect(() => {
    if (!documentos.length) return
    
    let filtered = [...documentos]
    
    // Aplicar filtro por tipo
    if (tipoFiltro !== "todos") {
      filtered = filtered.filter(doc => doc.tipo === tipoFiltro)
    }
    
    // Aplicar filtro por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        doc => 
          doc.titulo.toLowerCase().includes(term) ||
          doc.descripcion.toLowerCase().includes(term)
      )
    }
    
    setFilteredDocumentos(filtered)
  }, [searchTerm, tipoFiltro, documentos])

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

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Cargando documentos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Documentos</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
            
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as "todos" | "general" | "personal")}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los documentos</option>
              <option value="general">Documentos generales</option>
              <option value="personal">Documentos personales</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Lista de documentos */}
      {filteredDocumentos.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No se encontraron documentos que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocumentos.map((documento) => (
            <div key={documento.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {documento.tipo === 'general' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Globe className="h-3 w-3 mr-1" />
                        General
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Users className="h-3 w-3 mr-1" />
                        Personal
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {documento.created_at ? format(new Date(documento.created_at), "dd/MM/yyyy", { locale: es }) : ""}
                  </div>
                </div>
                
                <h2 className="text-l font-bold text-gray-900 mb-2">{documento.titulo}</h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {documento.descripcion}
                </p>
                
                {documento.archivo_url && (
                  <a
                    href={documento.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={documento.nombre_archivo || undefined}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    <span className="mr-1">
                      {documento.nombre_archivo || `${getFileType(documento.archivo_url)}`}
                    </span>
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              <div className="bg-gray-50 px-6 py-3">
                <div className="text-xs text-gray-500">
                  Publicado por: {documento.creador?.nombre
                    ? `${documento.creador.nombre} ${documento.creador.apellido || ""}`
                    : documento.creador?.email || "Usuario desconocido"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}