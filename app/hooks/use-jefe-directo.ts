"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/app/context/auth-context"

export function useJefeDirecto() {
  const [jefeDirecto, setJefeDirecto] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchJefeDirecto = async () => {
      if (!user?.id) return

      try {
        const supabase = createClientComponentClient()

        // Obtener el perfil del usuario actual para encontrar su jefe_directo_id
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("jefe_directo_id")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError

        if (profile?.jefe_directo_id) {
          setJefeDirecto(profile.jefe_directo_id)
        }
      } catch (err) {
        console.error("Error al obtener jefe directo:", err)
        setError("No se pudo obtener el jefe directo")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJefeDirecto()
  }, [user?.id])

  return { jefeDirecto, isLoading, error }
}

