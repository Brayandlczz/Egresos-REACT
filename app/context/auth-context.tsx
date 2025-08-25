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
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol:rol_id (rol), nombre')
          .eq('id', currentUser.id)
          .single()

        if (error) {
          console.error('Error al obtener datos del usuario:', error.message)
          setRol(null)
          setNombre(null)
        } else {
          setRol(data?.rol?.rol ?? null)
          setNombre(data?.nombre ?? null)
        }
      }

      setIsLoading(false)
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          supabase
            .from('usuarios')
            .select('rol:rol_id (rol), nombre')
            .eq('id', currentUser.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error('Error al obtener datos del usuario:', error.message)
                setRol(null)
                setNombre(null)
              } else {
                setRol(data?.rol?.rol ?? null)
                setNombre(data?.nombre ?? null)
              }
            })
        } else {
          setRol(null)
          setNombre(null)
        }
      }
    )

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, rol, nombre, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
