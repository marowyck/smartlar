import { createClient } from '@supabase/supabase-js'
import { env, supabaseConfigurado } from '@/config/env'

const url = env.supabaseUrl
const anonKey = env.supabaseAnonKey

export { supabaseConfigurado }

export const supabase = supabaseConfigurado
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function getSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
    )
  }
  return supabase
}
