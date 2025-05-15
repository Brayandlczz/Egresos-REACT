import { Mail, Phone } from "lucide-react"
import type { EmpleadoData } from "@/app/(auth)/directorios/page"

type EmpleadoCardProps = {
  empleado: EmpleadoData
}

export function EmpleadoCard({ empleado }: EmpleadoCardProps) {
  const nombreCompleto = `${empleado.nombre || ""}`.trim() || "Sin nombre"
  const iniciales = obtenerIniciales(nombreCompleto)

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-4 flex flex-col items-center">
        {/* Foto o avatar */}
        {empleado.foto_url ? (
          <div className="w-24 h-24 rounded-full overflow-hidden mb-3">
            <img
              src={empleado.foto_url || "/placeholder.svg"}
              alt={nombreCompleto}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <span className="text-blue-600 text-xl font-bold">{iniciales}</span>
          </div>
        )}

        {/* Información principal */}
        <h3 className="font-bold text-lg text-center">{nombreCompleto}</h3>

        {empleado.puesto && <p className="text-blue-600 text-sm text-center">{empleado.puesto}</p>}

        {empleado.departamento && <p className="text-gray-500 text-sm text-center mb-3">{empleado.departamento}</p>}

        {/* Línea divisoria */}
        <div className="w-full border-t border-gray-100 my-2"></div>

        {/* Contacto */}
        <div className="w-full space-y-2">
          {empleado.email && (
            <a
              href={`mailto:${empleado.email}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
            >
              <Mail size={16} className="text-gray-400" />
              <span className="truncate">{empleado.email}</span>
            </a>
          )}

          {empleado.telefono && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={16} className="text-gray-400" />
              <span>{empleado.telefono}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Función para obtener las iniciales del nombre
function obtenerIniciales(nombre: string): string {
  if (!nombre || nombre === "Sin nombre") return "U"

  const partes = nombre.split(" ")
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase()

  return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase()
}

