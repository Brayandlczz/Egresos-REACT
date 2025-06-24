"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import {
  DollarSign, LogOut, Menu, X, Pen, Wallet, CalendarDays,
  Users2, Building, File, Slack, Library, Timer, FileSpreadsheet,
  PersonStanding,
  Box,
  Bookmark,
  Workflow,
  FileStack,
} from "lucide-react"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  const toggleSidebar = () => setIsOpen(!isOpen)

  const isActive = (path: string) => {
    if (!pathname) return false
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

useEffect(() => {
  const fetchProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const userId = session?.user?.id
    if (!userId) return

    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("id, nombre, rol_id")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error al obtener usuario:", userError.message)
      return
    }

    const { data: rol, error: rolError } = await supabase
      .from("roles")
      .select("rol")
      .eq("id", user.rol_id)
      .single()

    if (rolError) {
      console.error("Error al obtener rol:", rolError.message)
      return
    }

    setProfile({ ...user, rol }) 
  }

  fetchProfile()
}, [])

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-[#0e2238] text-white rounded-md md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0e2238] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 justify-center">
            <img src="/uniciwhite.webp" alt="Logo UNICI" className="h-16 mx-auto" />
          </div>

            <nav className="flex-1 overflow-auto p-4">
              <ul className="space-y-2">
                {[
                  { href: "/dashboard", label: "Panel principal", icon: <Slack size={20} /> },
                  { href: "/planteles", label: "Planteles", icon: <Building size={20} /> },
                  { href: "/facturas", label: "Facturas", icon: <File size={20} /> },
                  { href: "/conceptos", label: "Conceptos de pago", icon: <DollarSign size={20} /> },
                  { href: "/ofertas", label: "Ofertas Educativas", icon: <Library size={20} /> },
                  { href: "/modulos", label: "Módulos", icon: <Pen size={20} /> },
                  { href: "/cuentas", label: "Cuentas Bancarias", icon: <Wallet size={20} /> },
                  { href: "/periodos", label: "Periodos de pago", icon: <CalendarDays size={20} /> },
                  { href: "/docentes", label: "Docentes", icon: <Users2 size={20} /> },
                  { href: "/historico", label: "Históricos de pago", icon: <Timer size={20} /> },
                  { href: "/reportes", label: "Reportes de pago", icon: <FileSpreadsheet size={20} /> },
                ].map(({ href, label, icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-3 p-2 rounded-md transition-all text-white ${
                        isActive(href)
                          ? "bg-white/30 hover:bg-white/50 shadow-md translate-y-[-1px]"
                          : "hover:bg-white/10 hover:shadow-md hover:translate-y-[-1px]"
                      }`}
                    >
                      {icon}
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="pt-6 border-t border-white/20 mt-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer text-xs font-medium text-white mb-2 group-open:text-gray-300">
                    <span className="w-full text-center">Proveedores</span>
                    <span className="text-sm ml-2">▼</span>
                  </summary>
                  <ul className="space-y-2 pl-2">
                    <li>
                      <Link
                        href="/proveedores"
                        className={`flex items-center gap-3 p-2 rounded-md text-white transition-all ${
                          isActive("/proveedores")
                            ? "bg-white/30 hover:bg-white/50 shadow-md translate-y-[-1px]"
                            : "hover:bg-white/10 hover:shadow-md hover:translate-y-[-1px]"
                        }`}
                      >
                        <Box size={20} />
                        <span>Listado & registro</span>
                      </Link>
                    </li>
                  </ul>

                  <ul className="space-y-2 pl-2">
                    <li>
                      <Link
                        href="/areas"
                        className={`flex items-center gap-3 p-2 rounded-md text-white transition-all ${
                          isActive("/areas")
                            ? "bg-white/30 hover:bg-white/50 shadow-md translate-y-[-1px]"
                            : "hover:bg-white/10 hover:shadow-md hover:translate-y-[-1px]"
                        }`}
                      >
                        <Workflow size={20} />
                        <span>Áreas de consumo</span>
                      </Link>
                    </li>
                  </ul>

                  <ul className="space-y-2 pl-2">
                    <li>
                      <Link
                        href="/etiquetas"
                        className={`flex items-center gap-3 p-2 rounded-md text-white transition-all ${
                          isActive("/etiquetas")
                            ? "bg-white/30 hover:bg-white/50 shadow-md translate-y-[-1px]"
                            : "hover:bg-white/10 hover:shadow-md hover:translate-y-[-1px]"
                        }`}
                      >
                        <Bookmark size={20} />
                        <span>Etiquetas de egreso</span>
                      </Link>
                    </li>
                  </ul>

                  <ul className="space-y-2 pl-2">
                    <li>
                      <Link
                        href="/egresos"
                        className={`flex items-center gap-3 p-2 rounded-md text-white transition-all ${
                          isActive("/egresos")
                            ? "bg-white/30 hover:bg-white/50 shadow-md translate-y-[-1px]"
                            : "hover:bg-white/10 hover:shadow-md hover:translate-y-[-1px]"
                        }`}
                      >
                        <FileStack size={20} />
                        <span>Registro de egresos</span>
                      </Link>
                    </li>
                  </ul>
                </details>
              </div>
              
              {profile?.rol?.rol === "Administrador" && (
                <div className="pt-6 border-t border-white/20 mt-4">
                  <button
                    onClick={() => setAdminOpen((prev) => !prev)}
                    className="flex items-center justify-between w-full text-xs font-medium text-white mb-2 hover:text-gray-300"
                  >
                    <span className="w-full text-center">Administradores</span>
                    <span className="ml-2 text-sm">{adminOpen ? "▲" : "▼"}</span>
                  </button>

                  <ul
                    className={`space-y-2 overflow-hidden transition-all duration-300 ease-in-out ${
                      adminOpen ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <li>
                      <Link
                        href="/admin/users"
                        className={`flex items-center gap-3 p-2 rounded-md text-white transition-all ${
                          isActive("/admin/avisos")
                            ? "bg-white/30 hover:bg-white/50 shadow-md translate-y-[-1px]"
                            : "hover:bg-white/10 hover:shadow-md hover:translate-y-[-1px]"
                        }`}
                      >
                        <PersonStanding size={20} />
                        <span>Registro de usuarios</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </nav>

          <div className="p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 p-2 w-full text-left text-red-600 rounded-md hover:bg-gray-200 hover:shadow-md hover:translate-y-[-1px]"
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
