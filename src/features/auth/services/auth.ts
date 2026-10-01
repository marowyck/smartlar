import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'

export function supabaseConfigurado() {
  return supabase != null
}

export function obterSessao() {
  if (!supabase) return Promise.resolve(null)
  return supabase.auth.getSession().then(({ data }) => data.session)
}

export function observarSessao(aoMudar: (evento: AuthChangeEvent, sessao: Session | null) => void) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(aoMudar)
  return () => data.subscription.unsubscribe()
}

export async function entrar(email: string, password: string) {
  if (!supabase) throw new Error('Supabase não configurado.')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function sair() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
