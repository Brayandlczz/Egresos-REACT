"use client"

import { useState, useEffect } from "react"
import { DirectorioHeader } from "./directorio-header"
import { DirectorioGrid } from "./directorio-grid"
import { EmpleadoCard } from "./empleado-card"
import type { EmpleadoData } from "@/app/(auth)/directorio/page"

type DirectorioClientProps = {
  empleadosIniciales: EmpleadoData[]
}

export function DirectorioClient({ empleadosIniciales }: DirectorioClientProps) {
  const [empleados, setEmpleados] = useState<EmpleadoData[]>(empleadosIniciales)
  const [filteredEmpleados, setFilteredEmpleados] = useState<EmpleadoData[]>(empleadosIniciales)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar empleados cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmpleados(empleados)
      return
    }

    const termLower = searchTerm.toLowerCase()
    const filtered = empleados.filter(
      (empleado) =>
        empleado.nombre?.toLowerCase().includes(termLower) ||
        "" ||
        empleado.departamento?.toLowerCase().includes(termLower) ||
        "" ||
        empleado.puesto?.toLowerCase().includes(termLower) ||
        "" ||
        empleado.email?.toLowerCase().includes(termLower) ||
        "",
    )

    setFilteredEmpleados(filtered)
  }, [searchTerm, empleados])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  return (
    <div className="space-y-6">
      <DirectorioHeader empleadosCount={filteredEmpleados.length} onSearch={handleSearch} />

      {filteredEmpleados.length > 0 ? (
        <DirectorioGrid>
          {filteredEmpleados.map((empleado) => (
            <EmpleadoCard key={empleado.id} empleado={empleado} />
          ))}
        </DirectorioGrid>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No se encontraron empleados que coincidan con tu búsqueda.
        </div>
      )}
    </div>
  )
}

