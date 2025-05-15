// app/(auth)/admin/documentos/page.tsx
import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Plus } from "lucide-react"
import { DocumentosTable } from "@/app/components/documentos/documentos-table"

export default async function GestionDocumentosPage() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar si el usuario es administrador
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Documentos</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Debes iniciar sesión para acceder a esta página.
        </div>
      </div>
    )
  }

  // Obtener el rol del usuario
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role_id, roles(nombre)")
    .eq("id", session.user.id)
    .single()

  // Verificar si el usuario es admin o adminRh
  const rolNombre = profileData?.roles?.nombre
  const isAdmin = rolNombre === "admin" || rolNombre === "adminRh"

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Documentos</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          No tienes permisos para acceder a esta página.
        </div>
      </div>
    )
  }

  // Modificar la consulta para incluir los empleados asignados a documentos personales
  // Reemplazar la consulta actual por esta versión mejorada:

  // Obtener todos los documentos con información completa
  const { data: documentos, error: docError } = await supabase
    .from("documentos")
    .select(`
    *,
    creador:profiles(nombre, email)
  `)
    .order("created_at", { ascending: false })

  if (docError) {
    console.error("Error al obtener documentos:", docError)
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gestión de Documentos</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error al cargar documentos: {docError.message}
        </div>
      </div>
    )
  }

  // Obtener las asignaciones de documentos a empleados
  const { data: documentosEmpleados, error: docEmpError } = await supabase.from("documentos_empleados").select(`
    documento_id,
    empleado:profiles(id, nombre, email)
  `)

  if (docEmpError) {
    console.error("Error al obtener asignaciones:", docEmpError)
  }

  // Agrupar empleados por documento
  const empleadosPorDocumento = {}
  documentosEmpleados?.forEach((asignacion) => {
    if (!empleadosPorDocumento[asignacion.documento_id]) {
      empleadosPorDocumento[asignacion.documento_id] = []
    }
    empleadosPorDocumento[asignacion.documento_id].push(asignacion.empleado)
  })

  // Añadir empleados a cada documento
  const documentosConEmpleados = documentos.map((doc) => ({
    ...doc,
    empleados: empleadosPorDocumento[doc.id] || [],
  }))

  // Obtener lista de todos los empleados para el filtro
  const { data: todosEmpleados } = await supabase.from("profiles").select("id, nombre, email").order("nombre")

  console.log("Documentos con datos de creador:", documentosConEmpleados)

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Documentos</h1>
        <Link
          href="/admin/documentos/nuevo"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Crear nuevo documento</span>
        </Link>
      </div>

      <DocumentosTable documentos={documentosConEmpleados || []} todosEmpleados={todosEmpleados || []} />
    </div>
  )
}

