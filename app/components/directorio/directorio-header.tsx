import { Search, Users } from "lucide-react"

type DirectorioHeaderProps = {
  empleadosCount: number
}

export function DirectorioHeader({ empleadosCount }: DirectorioHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 text-blue-600">
        <Users size={20} />
        <span className="font-medium">{empleadosCount} empleados</span>
      </div>

      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre, departamento o puesto..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

