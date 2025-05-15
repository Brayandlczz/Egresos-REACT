"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { User, Pencil, Save, X, Upload, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

type Profile = {
  id: string
  email?: string
  nombre?: string
  role?: string
  nacionalidad?: string
  lugar_nacimiento?: string
  rfc?: string
  imss?: string
  curp?: string
  estado_civil?: string
  fecha_nacimiento?: string
  genero?: string
  calle?: string
  numero_exterior?: string
  numero_interior?: string
  colonia?: string
  municipio?: string
  entidad_federativa?: string
  codigo_postal?: string
  telefono?: string
  departamento?: string
  puesto?: string
  jefe_directo?: string
  foto_url?: string
  fecha_ingreso?: string
  estado?: string
  created_at?: string
  updated_at?: string
}

// Datos de ejemplo para mostrar en caso de error
const sampleProfile: Profile = {
  id: "usuario-ejemplo",
  nombre: "Juan",
  email: "juan.perez@empresa.com",
  role: "Empleado",
  departamento: "Tecnología",
  puesto: "Desarrollador",
  fecha_ingreso: "2023-01-15",
  estado: "Activo",
  nacionalidad: "Mexicana",
  lugar_nacimiento: "Ciudad de México",
  fecha_nacimiento: "1990-05-20",
  genero: "Masculino",
  estado_civil: "Soltero/a",
  curp: "PERJ900520HDFRZN09",
  rfc: "PERJ900520ABC",
  imss: "12345678901",
  calle: "Av. Reforma",
  numero_exterior: "123",
  colonia: "Centro",
  municipio: "Cuauhtémoc",
  entidad_federativa: "Ciudad de México",
  codigo_postal: "06000",
  telefono: "5555123456",
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Profile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("personal")
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [usingSampleData, setUsingSampleData] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Función para añadir información de depuración
  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
    console.log(info)
  }

  // Función para crear un perfil en Supabase
  const createProfile = async (userId: string) => {
    try {
      addDebugInfo(`Intentando crear perfil para usuario: ${userId}`)

      // Crear un perfil con datos de ejemplo
      const newProfile = {
        ...sampleProfile,
        id: userId,
      }

      const { data, error } = await supabase.from("profiles").upsert(newProfile).select()

      if (error) {
        throw error
      }

      addDebugInfo("Perfil creado exitosamente")
      return newProfile
    } catch (error: any) {
      addDebugInfo(`Error al crear perfil: ${error.message}`)
      throw error
    }
  }

  // Función para obtener la sesión actual
  const getSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        addDebugInfo(`Error al obtener sesión: ${error.message}`)
        return null
      }

      if (!data.session) {
        addDebugInfo("No hay sesión activa")
        return null
      }

      addDebugInfo(`Sesión obtenida para usuario: ${data.session.user.id}`)
      return data.session
    } catch (error: any) {
      addDebugInfo(`Error al verificar sesión: ${error.message}`)
      return null
    }
  }

  // Función para cargar el perfil
  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener la sesión actual
      const session = await getSession()

      if (!session) {
        addDebugInfo("No se pudo obtener la sesión, usando datos de ejemplo")
        setProfile(sampleProfile)
        setFormData(sampleProfile)
        setUsingSampleData(true)
        return
      }

      const userId = session.user.id
      addDebugInfo(`Intentando cargar perfil para usuario: ${userId}`)

      // Intentar obtener el perfil
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        addDebugInfo(`Error al cargar perfil: ${error.message}`)

        // Intentar crear un perfil si no existe
        try {
          const newProfile = await createProfile(userId)
          setProfile(newProfile)
          setFormData(newProfile)
          setSuccess("Se ha creado un perfil con datos de ejemplo")
          return
        } catch (createError) {
          addDebugInfo("No se pudo crear perfil, usando datos de ejemplo")
          setProfile(sampleProfile)
          setFormData(sampleProfile)
          setUsingSampleData(true)
          return
        }
      }

      addDebugInfo("Perfil cargado correctamente")
      setProfile(data)
      setFormData(data)
    } catch (error: any) {
      console.error("Error al cargar perfil:", error)
      addDebugInfo(`Error general: ${error.message}`)

      // En caso de cualquier error, mostrar datos de ejemplo
      setProfile(sampleProfile)
      setFormData(sampleProfile)
      setUsingSampleData(true)
      setError("Se están mostrando datos de ejemplo debido a un error")
    } finally {
      setLoading(false)
    }
  }

  // Cargar el perfil cuando el componente se monte
  useEffect(() => {
    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!formData) return

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData) return

    try {
      setError(null)
      setSuccess(null)

      if (usingSampleData) {
        // Si estamos usando datos de ejemplo, solo simular la actualización
        setProfile(formData)
        setSuccess("Perfil actualizado correctamente (modo simulación)")
        setEditing(false)
        return
      }

      // Obtener la sesión actual
      const session = await getSession()

      if (!session) {
        throw new Error("No hay sesión activa")
      }

      const { error } = await supabase.from("profiles").update(formData).eq("id", session.user.id)

      if (error) throw error

      setProfile(formData)
      setSuccess("Perfil actualizado correctamente")
      setEditing(false)
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error)
      setError(error.message)
    }
  }

  const handleCancel = () => {
    setFormData(profile)
    setEditing(false)
    setError(null)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    try {
      setUploading(true)
      setError(null)

      if (usingSampleData) {
        setTimeout(() => {
          setSuccess("Foto de perfil actualizada correctamente (modo simulación)")
          setUploading(false)
        }, 1500)
        return
      }

      // Obtener la sesión actual
      const session = await getSession()

      if (!session) {
        throw new Error("No hay sesión activa")
      }

      // Crear un nombre de archivo único
      const fileExt = file.name.split(".").pop()
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Subir el archivo
      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtener la URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath)

      // Actualizar el perfil con la nueva URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ foto_url: publicUrl })
        .eq("id", profile.id)

      if (updateError) throw updateError

      // Actualizar el estado local
      setProfile({
        ...profile,
        foto_url: publicUrl,
      })

      setSuccess("Foto de perfil actualizada correctamente")
    } catch (error: any) {
      console.error("Error al subir avatar:", error)
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Cargando información del perfil...</p>
      </div>
    )
  }

  // Si tenemos un perfil (real o de ejemplo), mostrar la interfaz
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

      {usingSampleData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Se están mostrando datos de ejemplo. Los cambios no se guardarán en la base de datos.</p>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Cabecera con foto de perfil */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 h-40">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white p-1 shadow-md">
                {profile?.foto_url ? (
                  <img
                    src={profile.foto_url || "/placeholder.svg"}
                    alt={profile.nombre || "Avatar"}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={48} className="text-blue-500" />
                  </div>
                )}
              </div>

              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-600 transition-colors"
              >
                <Upload size={16} />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-4 right-4 bg-white text-blue-500 p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors"
            >
              <Pencil size={16} />
            </button>
          ) : (
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={handleCancel}
                className="bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
              >
                <X size={16} />
              </button>
              <button
                onClick={handleSubmit}
                className="bg-white text-green-500 p-2 rounded-full shadow-md hover:bg-green-50 transition-colors"
              >
                <Save size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Contenido del perfil */}
        <div className="pt-20 px-8 pb-8">
          {!editing ? (
            // Modo visualización
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {profile?.nombre}
                </h2>
                <p className="text-blue-500">{profile?.puesto}</p>
                <p className="text-gray-500">{profile?.departamento}</p>
              </div>

              {/* Tabs de navegación */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab("personal")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "personal"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Información Personal
                  </button>
                  <button
                    onClick={() => setActiveTab("contacto")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "contacto"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Contacto y Dirección
                  </button>
                  <button
                    onClick={() => setActiveTab("laboral")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "laboral"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Información Laboral
                  </button>
                </nav>
              </div>

              {/* Contenido de las tabs */}
              <div className="pt-4">
                {activeTab === "personal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Datos personales</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p>{profile?.email || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                          <p>{profile?.fecha_nacimiento || "No especificada"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Género</p>
                          <p>{profile?.genero || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estado civil</p>
                          <p>{profile?.estado_civil || "No especificado"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Nacionalidad y origen</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Nacionalidad</p>
                          <p>{profile?.nacionalidad || "No especificada"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Lugar de nacimiento</p>
                          <p>{profile?.lugar_nacimiento || "No especificado"}</p>
                        </div>
                      <h3 className="text-sm font-medium text-gray-500 mt-6 mb-3">Documentos oficiales</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">CURP</p>
                          <p>{profile?.curp || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">RFC</p>
                          <p>{profile?.rfc || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">IMSS</p>
                          <p>{profile?.imss || "No especificado"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                )}

                {activeTab === "contacto" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Información de contacto</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p>{profile?.telefono || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p>{profile?.email || "No especificado"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Dirección</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Calle y número</p>
                          <p>
                            {profile?.calle || "No especificada"}
                            {profile?.numero_exterior ? ` #${profile.numero_exterior}` : ""}
                            {profile?.numero_interior ? `, Int. ${profile.numero_interior}` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Colonia</p>
                          <p>{profile?.colonia || "No especificada"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Municipio</p>
                          <p>{profile?.municipio || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Entidad federativa</p>
                          <p>{profile?.entidad_federativa || "No especificada"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Código postal</p>
                          <p>{profile?.codigo_postal || "No especificado"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "laboral" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Puesto y departamento</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Puesto</p>
                          <p>{profile?.puesto || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Departamento</p>
                          <p>{profile?.departamento || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Jefe directo</p>
                          <p>{profile?.jefe_directo || "No especificado"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-3">Fechas y estado</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Fecha de ingreso</p>
                          <p>{profile?.fecha_ingreso || "No especificada"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estado</p>
                          <p>{profile?.estado || "No especificado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Rol asignado</p>
                          <p>{profile?.role || "No especificado"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Modo edición
            <form className="space-y-6">
              {/* Tabs de navegación para edición */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab("personal")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "personal"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Información Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("contacto")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "contacto"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Contacto y Dirección
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("laboral")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "laboral"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Información Laboral
                  </button>
                </nav>
              </div>

              {/* Contenido de las tabs en modo edición */}
              <div className="pt-4">
                {activeTab === "personal" && (
                  <>
                    <div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData?.nombre || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData?.email || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                        <input
                          type="date"
                          name="fecha_nacimiento"
                          value={formData?.fecha_nacimiento || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                        <select
                          name="genero"
                          value={formData?.genero || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado civil</label>
                        <select
                          name="estado_civil"
                          value={formData?.estado_civil || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Soltero/a">Soltero/a</option>
                          <option value="Casado/a">Casado/a</option>
                          <option value="Divorciado/a">Divorciado/a</option>
                          <option value="Viudo/a">Viudo/a</option>
                          <option value="Unión libre">Unión libre</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                        <input
                          type="text"
                          name="nacionalidad"
                          value={formData?.nacionalidad || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lugar de nacimiento</label>
                      <input
                        type="text"
                        name="lugar_nacimiento"
                        value={formData?.lugar_nacimiento || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CURP</label>
                        <input
                          type="text"
                          name="curp"
                          value={formData?.curp || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                        <input
                          type="text"
                          name="rfc"
                          value={formData?.rfc || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IMSS</label>
                        <input
                          type="text"
                          name="imss"
                          value={formData?.imss || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "contacto" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData?.telefono || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                      <input
                        type="text"
                        name="calle"
                        value={formData?.calle || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número exterior</label>
                        <input
                          type="text"
                          name="numero_exterior"
                          value={formData?.numero_exterior || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número interior</label>
                        <input
                          type="text"
                          name="numero_interior"
                          value={formData?.numero_interior || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Colonia</label>
                      <input
                        type="text"
                        name="colonia"
                        value={formData?.colonia || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                        <input
                          type="text"
                          name="municipio"
                          value={formData?.municipio || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entidad federativa</label>
                        <input
                          type="text"
                          name="entidad_federativa"
                          value={formData?.entidad_federativa || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código postal</label>
                      <input
                        type="text"
                        name="codigo_postal"
                        value={formData?.codigo_postal || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === "laboral" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                        <input
                          type="text"
                          name="puesto"
                          value={formData?.puesto || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                        <input
                          type="text"
                          name="departamento"
                          value={formData?.departamento || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jefe directo</label>
                      <input
                        type="text"
                        name="jefe_directo"
                        value={formData?.jefe_directo || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de ingreso</label>
                        <input
                          type="date"
                          name="fecha_ingreso"
                          value={formData?.fecha_ingreso || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          name="estado"
                          value={formData?.estado || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                          <option value="Suspendido">Suspendido</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Información de depuración (comentado por deshuso) */}
      {/*debugInfo.length > 0 && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-2 flex items-center">
            <span>Información de depuración</span>
            <button onClick={() => setDebugInfo([])} className="ml-2 text-xs text-gray-500 hover:text-gray-700">
              (Limpiar)
            </button>
          </h3>
          <div className="max-h-40 overflow-y-auto">
            <ul className="text-xs text-gray-700 space-y-1">
              {debugInfo.map((info, index) => (
                <li key={index} className="border-b border-gray-100 pb-1">
                  • {info}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )*/}
    </div>
  )
}

