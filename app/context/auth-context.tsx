'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  rol: string | null
  nombre: string | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  rol: null,
  nombre: null,
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = useSupabaseClient()
  const [user, setUser] = useState<User | null>(null)
  const [rol, setRol] = useState<string | null>(null)
  const [nombre, setNombre] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // Forzamos `any` para evitar inferencias problemáticas
          const res: any = await supabase
            .from('usuarios')
            // rol viene via relación rol_id -> rol; la relación puede llegar como array
            .select('rol:rol_id (rol), nombre')
            .eq('id', currentUser.id)
            .single()

          const data: any = res.data
          const error: any = res.error

          if (error) {
            console.error('Error al obtener datos del usuario:', error.message ?? error)
            setRol(null)
            setNombre(null)
          } else {
            // Normalizamos: data.rol puede ser [{ rol: '...' }] o { rol: '...' }
            const rolValue =
              Array.isArray(data?.rol) ? data?.rol?.[0]?.rol ?? null : data?.rol?.rol ?? null
            setRol(rolValue)
            setNombre(data?.nombre ?? null)
          }
        }
      } catch (err) {
        console.error('Error al obtener sesión/usuario:', err)
        setUser(null)
        setRol(null)
        setNombre(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Usamos una IIFE async con try/catch (evita .then().catch() y problemas de typings)
        ;(async () => {
          try {
            const res: any = await supabase
              .from('usuarios')
              .select('rol:rol_id (rol), nombre')
              .eq('id', currentUser.id)
              .single()

            const data: any = res.data
            const error: any = res.error

            if (error) {
              console.error('Error al obtener datos del usuario:', error.message ?? error)
              setRol(null)
              setNombre(null)
            } else {
              const rolValue =
                Array.isArray(data?.rol) ? data?.rol?.[0]?.rol ?? null : data?.rol?.rol ?? null
              setRol(rolValue)
              setNombre(data?.nombre ?? null)
            }
          } catch (err) {
            console.error('Error inesperado al obtener datos del usuario:', err)
            setRol(null)
            setNombre(null)
          }
        })()
      } else {
        setRol(null)
        setNombre(null)
      }
    })

    return () => {
      // cleanup: protección si cambia la API interna
      try {
        listener?.subscription?.unsubscribe?.()
      } catch (e) {
        // no-op
      }
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, rol, nombre, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
