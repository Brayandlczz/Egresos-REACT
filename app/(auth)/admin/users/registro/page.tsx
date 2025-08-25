"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ThreeDot } from "react-loading-indicators"

export default function RegistroUsuarioForm() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<{ id: number; rol: string }[]>([])
  const [rolId, setRolId] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from("roles").select("id, rol")
      if (error) {
        console.error("Error al cargar roles:", error.message)
      } else {
        setRoles(data || [])
      }
    }
    fetchRoles()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email.trim() || !password.trim() || !rolId) {
      setError("Por favor, completa todos los campos.")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/usuarios/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rol_id: rolId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Error desconocido")
        setIsSubmitting(false)
        return
      }

      setSuccessMessage("¡Usuario registrado con éxito!")
      setTimeout(() => {
        router.push("/admin/users")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Error de red")
      setIsSubmitting(false)
    } finally {
      setTimeout(() => {
        setIsSubmitting(false)
      }, 1000)
    }
  }

  const handleCancelar = () => {
    router.push("/admin/users")
  }

  return (
    <div className="relative p-8 bg-gray-50 max-h-screen max-h-screen flex items-center justify-center">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <ThreeDot color="#2464ec" size="large" />
        </div>
      )}

      <div className="w-full  bg-white border rounded shadow">
        <div className="bg-blue-600 text-white px-6 py-3 rounded-t">
          <h1 className="text-xl font-semibold">
            Usuarios | Registro de usuarios
          </h1>
        </div>

        <div className="p-6">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded shadow">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="block mb-1 font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block mb-1 font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="rol" className="block mb-1 font-medium">
                Rol
              </Label>
                <select
                  id="rol"
                  name="rol"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={rolId}
                  onChange={(e) => setRolId(e.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.rol} 
                    </option>
                  ))}
                </select>
            </div>

            <div className="flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={handleCancelar}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 text-white px-2 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Registrando..." : "Registrar usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
