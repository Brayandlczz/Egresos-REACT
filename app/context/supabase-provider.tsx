'use client'

import { useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { Session, SupabaseClient } from '@supabase/auth-helpers-nextjs'

interface Props {
  children: React.ReactNode
  initialSession?: Session | null
}

export default function SupabaseProvider({ children, initialSession }: Props) {
  const [supabaseClient] = useState(() => createPagesBrowserClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={initialSession}
    >
      {children}
    </SessionContextProvider>
  )
}
