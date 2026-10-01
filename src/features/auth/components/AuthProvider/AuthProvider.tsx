import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from '@/features/auth/hooks/auth-context'
import { entrar, observarSessao, obterSessao, sair, supabaseConfigurado } from '@/features/auth/services/auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabaseConfigurado())

  useEffect(() => {
    if (!supabaseConfigurado()) return

    let ativo = true
    obterSessao().then((atual) => {
      if (!ativo) return
      setSession(atual)
      setLoading(false)
    })

    const cancelar = observarSessao((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      ativo = false
      cancelar()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      configurado: supabaseConfigurado(),
      signIn: entrar,
      signOut: sair,
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
