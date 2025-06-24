'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  rol: string | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  rol: null,
  isLoading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [rol, setRol] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol:rol_id (rol)')
          .eq('id', currentUser.id)
          .single()

        if (error) {
          console.error('Error al obtener rol:', error.message)
          setRol(null)
        } else {
          setRol(data?.rol?.rol ?? null)
        }
      }

      setIsLoading(false)
    }

    fetchSession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('usuarios')
          .select('rol:rol_id (rol)')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error al obtener rol:', error.message)
              setRol(null)
            } else {
              setRol(data?.rol?.rol ?? null)
            }
          })
      } else {
        setRol(null)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, rol, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
