"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabaseClient"
import { Button } from "@/components/ui/button"

export default function RegistroUsuarioForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)

  const formData = new FormData(e.currentTarget)
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  
console.log({ email, password });

  try {
    const response = await fetch("/api/usuarios/crear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setError(result.error || "Error desconocido")
      setIsSubmitting(false)
      return
    }

    router.push("/usuarios")
  } catch (error: any) {
    setError(error.message || "Error de red")
    setIsSubmitting(false)
  }
}

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">Registro de Usuario</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-100 p-6 rounded-md shadow">

        <div className="space-y-1">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Registrando..." : "Registrar usuario"}
        </Button>
      </form>
    </div>
  )
}
