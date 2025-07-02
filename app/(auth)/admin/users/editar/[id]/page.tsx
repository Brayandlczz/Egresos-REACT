"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ThreeDot } from "react-loading-indicators"

export default function EditarUsuarioForm() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams?.get("id") 

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<{ id: number; rol: string }[]>([])
  const [rolId, setRolId] = useState("")
  const [email, setEmail] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase.from("roles").select("id, rol")
      if (error) console.error("Error al obtener roles:", error)
      else setRoles(data || [])
    }

    const fetchUser = async () => {
      if (!userId) return
      const { data, error } = await supabase
        .from("usuarios")
        .select("email, rol_id")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("Error al cargar usuario:", error)
        setError("No se pudo cargar el usuario.")
      } else {
        setEmail(data.email || "")
        setRolId(data.rol_id?.toString() || "")
      }
    }

    fetchRoles()
    fetchUser()
  }, [userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!email.trim() || !rolId || !userId) {
      setError("Todos los campos son obligatorios.")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/usuarios/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, email, rol_id: Number(rolId), }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Error al editar usuario.")
        return
      }

      setSuccessMessage("¡Usuario actualizado con éxito!")
      setTimeout(() => router.push("/admin/users"), 2000)
    } catch (err: any) {
      setError(err.message || "Error de red.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelar = () => router.push("/admin/users")

  return (
    <div className="relative p-8 bg-gray-50 max-h-screen flex items-center justify-center">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
          <ThreeDot color="#2464ec" size="large" />
        </div>
      )}

      <div className="w-full bg-white border rounded shadow">
        <div className="bg-blue-600 text-white px-6 py-3 rounded-t">
          <h1 className="text-xl font-semibold">Usuarios | Editar usuario</h1>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
