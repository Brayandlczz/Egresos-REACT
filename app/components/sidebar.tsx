"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { LayoutDashboard, User, Calendar, BookOpen, Bell, LogOut, Menu, X, Settings, FileText, FilePen, Megaphone, AlertTriangle } from "lucide-react"

type Profile = {
  id: string
  nombre?: string
  apellido?: string
  email?: string
  role_id?: string
  avatar_url?: string
  roles?: { nombre: string } 
}

export function Sidebar() {
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase.from("profiles").select("*, roles(nombre)").eq("id", user.id).single();


        if (error) {
        console.error("Error al obtener el perfil:", error);
        }

        if (data) {
          setProfile(data);
        } else {
          setProfile({ id: user.id })
        }
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Cerrar el sidebar en móvil cuando se navega a una nueva página
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Botón de menú móvil */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para móvil */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y título */}
          <div className="p-4 border-b justify-center">
          <img src="logounici.webp" alt="Logo UNICI" className="h-16 mx-auto" />
          </div>

          {/* Perfil de usuario */}
          {profile && (
            <div className="flex items-center gap-3 p-4 border-b">
              <Link href="/perfil">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold cursor-pointer">
                  {profile.nombre ? profile.nombre[0] : profile.email?.[0] || "U"}
                </div>
              </Link>
              <div className="flex flex-col">
                <span className="font-medium">
                  {profile.nombre ? `${profile.nombre} ${profile.apellido || ""}` : profile.email || "Usuario"}
                </span>
                <span className="text-xs text-gray-500">Rol: {profile.roles?.nombre || "nop"}</span>
                </div>
            </div>
          )}

          {/* Navegación */}
          <nav className="flex-1 overflow-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 p-2 rounded-md transition-all ${
                    isActive("/dashboard")
                      ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
                      : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
                  }`}
                >
                  <LayoutDashboard size={20} />
                  <span>Panel principal</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/perfil"
                  className={`flex items-center gap-3 p-2 rounded-md transition-all ${
                    isActive("/perfil")
                      ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
                      : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
                  }`}
                >
                  <User size={20} />
                  <span>Mi perfil</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/directorios"
                  className={`flex items-center gap-3 p-2 rounded-md transition-all ${
                    isActive("/directorios")
                      ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
                      : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
                  }`}
                  onClick={() => console.log("Navegando a directorio")}
                >
                  <BookOpen size={20} />
                  <span>Directorio</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/calendario"
                  className={`flex items-center gap-3 p-2 rounded-md transition-all ${
                    isActive("/calendario")
                      ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
                      : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
                  }`}
                >
                  <Calendar size={20} />
                  <span>Calendario</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/gestor-solicitudes"
                  className={`flex items-center gap-3 p-2 rounded-md transition-all ${
                    isActive("/solicitudes")
                      ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
                      : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
                  }`}
                >
                  <FilePen size={20} />
                  <span>Solicitudes</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/avisos"
                  className={`flex items-center gap-3 p-2 rounded-md transition-all ${
                    isActive("/avisos")
                      ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
                      : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
                  }`}
                >
                  <Megaphone size={20} />
                  <span>Avisos y comunicados</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/documentos"
                  className={`flex items-center gap-3 p-2 rounded-md transition-all ${
                    isActive("/documentos")
                      ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
                      : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
                  }`}
                >
                 <FileText size={20} />
                 <span>Documentos</span>
                 </Link>
              </li>
            </ul>
          </nav>
          {/* Sección visible solo para Admin */}
  {profile?.roles?.nombre === "admin" && (
  <div className="p-4 border-t">
    <h3 className="text-xs font-medium text-gray-500 mb-2">Administración</h3>
    <ul className="space-y-2">
      <li>
        <Link
          href="/admin/avisos"
          className={`flex items-center gap-3 p-2 rounded-md transition-all ${
            isActive("/admin/avisos")
              ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
              : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
          }`}
        >
          <Settings size={20} />
          <span>Gestión de Avisos</span>
        </Link>
      </li>

      <li>
        <Link
          href="/admin/documentos"
          className={`flex items-center gap-3 p-2 rounded-md transition-all ${
            isActive("/admin/documentos")
              ? "bg-blue-50 text-blue-700 shadow-[3px_3px_0px_0px_#BFDBFE] transform translate-y-[-1px]"
              : "hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-y-[-1px]"
          }`}
        >
          <FileText size={20} />
          <span>Gestión de Documentos</span>
        </Link>
      </li>

    </ul>
  </div>
)}
          {/* Cerrar sesión */}
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 p-2 w-full text-left text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

