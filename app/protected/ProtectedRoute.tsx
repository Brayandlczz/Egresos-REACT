'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/app/context/auth-context'

interface ProtectedRouteProps {
  requiredRole?: string
  children: React.ReactNode
}

const ProtectedRoute = ({ requiredRole, children }: ProtectedRouteProps) => {
  const router = useRouter()
  const { user, rol, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login')
      } else if (requiredRole && rol !== requiredRole) {
        router.replace('/unauthorized')
      }
    }
  }, [isLoading, user, rol, requiredRole, router])

  if (isLoading || !user || (requiredRole && rol !== requiredRole)) {
    return null
  }

  return <>{children}</>
}

export default ProtectedRoute
