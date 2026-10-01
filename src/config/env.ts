function limpar(valor: string | undefined) {
  const texto = valor?.trim()
  return texto ? texto : undefined
}

export const env = {
  supabaseUrl: limpar(import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: limpar(import.meta.env.VITE_SUPABASE_ANON_KEY),
}

export const supabaseConfigurado = Boolean(env.supabaseUrl && env.supabaseAnonKey)
