"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/dashboard")
      }
    }

    checkSession()
  }, [router, supabase])

  // Modificar la función handleLogin para añadir más feedback
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Intentando iniciar sesión con:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de autenticación:", error)
        throw error
      }

      console.log("Login exitoso:", data.user)

      // Mostrar mensaje de éxito antes de redirigir
      setError("Login exitoso! Redirigiendo...")

      // Pequeña pausa para mostrar el mensaje de éxito
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1500)
    } catch (error: any) {
      console.error("Error completo:", error)
      setError(error.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        {/* Lado izquierdo - Imagen/Logo */}
        <div className="bg-blue-600 text-white p-8 md:w-1/2 flex flex-col justify-center items-center">
          <div className="mb-8">
            <div className="flex items-center justify-center">
            <img src="/logo-blanco.png" alt="Logo UNICI" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-center">PORTAL UNICI</h1>
          <p className="text-blue-100 text-center">
            Plataforma Integral para la Gestión de Recursos Humanos y Comunicación interna
          </p>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="p-8 md:w-1/2">
          <div className="mb-8">
            <h2 className="text-2xl text-center font-bold text-gray-800 mb-2">UNICI - INTRANET</h2>
            <p className="text-gray-600">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div
              className={`mb-4 p-3 rounded ${error.includes("exitoso") ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Usuario"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contraseña"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">¿Olvidaste tu contraseña? Contacta al Administrador</p>
          </div>
        </div>
      </div>
    </div>
  )
}

